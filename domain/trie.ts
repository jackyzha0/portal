import {mkdir, read, writeFile} from '../fs/io'
import {Registry} from './registry'

// Possible trie node statuses
export enum STATUS {
  unsynced,
  error,
  synced
}

// Single trienode representing a file/folder
export class TrieNode {
  key: string
  parent: TrieNode | null
  children: Record<string, TrieNode>
  isDir: boolean
  status: STATUS
  private readonly registry: Registry

  constructor(registry: Registry, key: string, isDir = false) {
    this.key = key
    this.parent = null
    this.children = {}
    this.registry = registry
    this.status = STATUS.unsynced
    this.isDir = isDir
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

  // Return full path to this node
  getPath() {
    return this.traverse().map(node => node.key)
  }

  // Return array of all children
  getChildren() {
    return Object.values(this.children)
  }

  // Generic tree operation over all unsynced nodes
  // opName: operation name for logging
  // op: operation to apply to each leaf node given the path
  // folderPreRun: operation to apply to each folder
  async _treeOp<T>(opName: string, op: (pathSegments: string[]) => Promise<T> | undefined, folderPreRun?: (path: string[]) => void): Promise<STATUS> {
    const path = this.getPath()

    // If folder, apply op to all files
    if (this.isDir) {
      // Do something with current path if necessary
      if (folderPreRun) {
        folderPreRun(path)
      }

      // Apply op to children children
      const statusPromises: Array<Promise<STATUS>> = this.getChildren().map(async child => child._treeOp(opName, op, folderPreRun))
      return Promise.all(statusPromises)
        .then(() => this.status = STATUS.synced)
        .catch((error: Error) => {
          this.registry.errorCallback(`[${opName}]: ${error.message}`)
          this.status = STATUS.error
          return this.status
        })
        .finally(() => {
          this.registry.rerender()
        })
    }

    // Dont apply op to already synced files
    if (this.status === STATUS.synced) {
      return Promise.resolve(this.status)
    }

    // Single file, apply operation
    const opResult = op(path)
    // ignore on empty res
    if (!opResult) {
      return Promise.resolve(this.status)
    }

    // Resolve promise
    return opResult
      .then(() => this.status = STATUS.synced)
      .catch((error: Error) => {
        this.registry.errorCallback(`[${opName}]: ${error.message}`)
        this.status = STATUS.error
        return this.status
      })
      .finally(() => {
        this.registry.rerender()
      })
  }

  // Recursively downloads current node and children from drive to local
  async download() {
    return this._treeOp(
      'download',
      pathSegments => this
        .registry.drive?.promises
        .readFile(pathSegments.join('/'))
        .then(async buf => writeFile(pathSegments, buf)),
      mkdir
    )
  }

  // Recursively syncs current node and children to given drive instance
  async sync() {
    return this._treeOp(
      'sync',
      async pathSegments => {
        const joinedPath = pathSegments.join('/')
        return read(joinedPath)
          .then(buf => this
            .registry.drive?.promises
            .writeFile(joinedPath, buf)
          )
      }
    )
  }
}
