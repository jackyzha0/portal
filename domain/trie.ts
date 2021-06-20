import {mkdir, read, writeFile} from "../fs/io";
import {Registry} from "./registry";

// Possible trie node statuses
export enum STATUS {
  unsynced,
  error,
  synced,
}

// Single trienode representing a file/folder
export class TrieNode {
  private registry: Registry
  key: string
  parent: TrieNode | null
  children: {[key: string]: TrieNode}
  isDir: boolean
  status: STATUS
  
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

    // skip root placeholder node
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

  // generic tree operation over all unsynced nodes
  // opName: operation name for logging
  // op: operation to apply to each leaf node given the path
  // folderPreRun: operation to apply to each folder
  _treeOp<T>(opName: string, op: (pathSegments: string[]) => Promise<T> | undefined, folderPreRun = (path: string[]) => {}): Promise<STATUS> {
    const path = this.getPath()

    // if folder, apply op to all files
    if (this.isDir) {
      // do something with current path if necessary
      folderPreRun(path)

      // apply op to children children
      const statusPromises: Promise<STATUS>[] = this.getChildren().map(child => child._treeOp(opName, op, folderPreRun))
      return Promise.all(statusPromises)
        .then(() => this.status = STATUS.synced)
        .catch(err => {
          this.registry.errorCallback(`[${opName}]: ${err.toString()}`)
          this.status = STATUS.error
          return this.status
        })
        .finally(() => {
          this.registry.rerender()
        })
    }

    // dont apply op to already synced files
    if (this.status === STATUS.synced) {
      return Promise.resolve(this.status)
    }

    // single file, apply operation
    const opRes = op(path)
    // ignore on empty res
    if (!opRes) return Promise.resolve(this.status)

    // resolve promise
    return opRes
      .then(() => this.status = STATUS.synced)
      .catch((err: Error) => {
        this.registry.errorCallback(`[${opName}]: ${err.toString()}`)
        this.status = STATUS.error
        return this.status
      })
      .finally(() => {
        this.registry.rerender()
      })
  }

  // Recursively downloads current node and children from drive to local
  download() {
    return this._treeOp(
      'download',
      (pathSegments) => this
        .registry.drive?.promises
        .readFile(pathSegments.join("/"))
        .then((buf) => writeFile(pathSegments, buf)),
       mkdir
    )
  }

  // Recursively syncs current node and children to given drive instance
  sync() {
    return this._treeOp(
      'sync',
      (pathSegments) => {
        const joinedPath = pathSegments.join("/")
        return read(joinedPath)
          .then(buf => this
            .registry.drive?.promises
            .writeFile(joinedPath, buf)
          )
      },
    )
  }
}
