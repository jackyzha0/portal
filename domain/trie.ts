import {backOff} from 'exponential-backoff'
import {mkdir, createReadStream, createWriteStream, pump, IStreamPumpStats} from '../fs/io'
import {Registry} from './registry'

// Possible trie node statuses
export enum STATUS {
  unsynced,
  syncing,
  waitingForRemote,
  error,
  synced,
}

// Single trienode representing a file/folder
export class TrieNode {
  key: string
  parent: TrieNode | null
  children: Record<string, TrieNode>
  isDir: boolean
  status: STATUS
  stats: IStreamPumpStats
  sizeBytes: number
  error: string | undefined
  private readonly registry: Registry

  constructor(registry: Registry, key: string, isDir = false, newSize?: number) {
    this.key = key
    this.parent = null
    this.children = {}
    this.registry = registry
    this.status = STATUS.unsynced
    this.isDir = isDir
    this.sizeBytes = newSize ?? 0
    this.stats = {
      numTransfers: 0,
      bytesPerSecond: 0,
      totalTransferred: 0,
      hasEnded: false,
    }
  }

  // Get list of all nodes from root to current node
  traverse() {
    const output = []
    let cur: TrieNode = this

    // Skip root placeholder node
    while (cur.parent !== null) {
      output.unshift(cur)
      cur = cur.parent
    }

    return output
  }

  markUnsynced() {
    if (this.status === STATUS.synced) {
      this.status = this.isDir ? STATUS.syncing : STATUS.unsynced
    }
  }

  // Return full path to this node
  getPath() {
    return this.traverse().map(node => node.key)
  }

  // Return array of all children
  getChildren() {
    return Object.values(this.children)
  }

  _updateParentStates() {
    this.traverse().reverse().forEach(node => {
      if (node.getChildren().every(child => child.status === STATUS.synced)) {
        node.status = STATUS.synced
      }
    })
    return this.status
  }

  // Generic tree operation over all unsynced nodes
  // opName: operation name for logging
  // op: operation to apply to each leaf node given the path
  // folderPreRun: operation to apply to each folder
  // ctx: shared context object for current working nodes
  async _treeOp<T, Ctx=Map<string, IStreamPumpStats>>(
    opName: string,
    op: (pathSegments: string[], ctx: Ctx) => Promise<T>,
    ctx: Ctx,
    folderPreRun?: (path: string[]) => void,
  ): Promise<STATUS> {
    const path = this.getPath()

    // If folder, apply op to all files
    if (this.isDir) {
      // Do something with current path if necessary
      if (folderPreRun) {
        folderPreRun(path)
      }

      // Apply op to children children
      const statusPromises: Array<Promise<STATUS>> = this.getChildren()
        .map(async child => child._treeOp(opName, op, ctx, folderPreRun))
      return Promise.all(statusPromises)
        .then(() => this._updateParentStates())
        .catch((error: Error) => {
          this.error = error.message
          this.status = STATUS.error
          return this.status
        })
    }

    // Dont apply op to already synced files
    if (this.status === STATUS.synced) {
      return Promise.resolve(this.status)
    }

    // Single file, apply operation
    const opResult = this.registry.q.add(async () => op(path, ctx), {priority: this.sizeBytes})

    // Resolve promise
    return opResult
      .then(() => this._updateParentStates())
      .catch((error: Error) => {
        this.error = error.message
        this.registry.errorCallback(`[${opName}] ${error.message}`)

        // Propagate up
        this.traverse().forEach(node => node.status = STATUS.error)
        this.status = STATUS.error
        return this.status
      })
  }

  // Recursively downloads current node and children from drive to local
  async download() {
    return this._treeOp(
      'download',
      async (pathSegments, ctx) => {
        const {drive} = this.registry
        if (!drive) {
          return Promise.reject(STATUS.error)
        }

        const joinedPath = pathSegments.join('/')
        return backOff(async () => {
          const readStream = drive.createReadStream(joinedPath)
          const writeStream = createWriteStream(joinedPath)
          ctx.set(joinedPath, this.stats)
          this.status = STATUS.syncing
          return pump(readStream, writeStream, this.stats, this.registry.refreshStats)
        }, {
          startingDelay: 500,
          retry: (error: Error, i) => {
            // If we fail to read stream from hyperdrive, most likely file is not
            // uploaded yet
            this.registry._debug(`[download] retry ${joinedPath} for the ${i} time: ${error.message}`)
            this.status = STATUS.waitingForRemote
            return true
          },
        })
      },
      this.registry.stats,
      mkdir,
    )
  }

  // Recursively syncs current node and children to given drive instance
  async sync() {
    return this._treeOp(
      'sync',
      async (pathSegments, ctx) => {
        const {drive} = this.registry
        if (!drive) {
          return Promise.reject(STATUS.error)
        }

        const joinedPath = pathSegments.join('/')
        const readStream = createReadStream(joinedPath)
        const writeStream = drive.createWriteStream(joinedPath)
        ctx.set(joinedPath, this.stats)
        this.status = STATUS.syncing
        return pump(readStream, writeStream, this.stats, this.registry.refreshStats)
      },
      this.registry.stats,
    )
  }
}
