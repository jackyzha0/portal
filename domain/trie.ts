// single file/folder node
import {read, writeFile} from "../fs/io";
import {Registry, STATUS} from "./registry";
import * as path from "path";

export class TrieNode {
  key: string
  parent: TrieNode | null
  children: {[key: string]: TrieNode}
  isDir: boolean
  status: STATUS
  private registry: Registry;
  
  constructor(registry: Registry, key: string, isDir = false) {
    this.key = key
    this.parent = null
    this.children = {}
    this.registry = registry
    this.status = STATUS.unsynced
    this.isDir = isDir
  }

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

  // return full path to this node
  getPath() {
    return this.traverse().map(node => node.key)
  }

  // return array of all children
  getChildren() {
    return Object.values(this.children)
  }

  _treeOp<T>(opName: string, op: (pathSegments: string[]) => Promise<T>, folderPreRun = (path: string[]) => {}): Promise<STATUS> {
    const path = this.getPath()

    // if folder, apply op to all files
    if (this.isDir) {
      // do something with current path if necessary
      folderPreRun(path)
      const statusPromises: Promise<STATUS>[] = this.getChildren().map(child => child._treeOp(opName, op, folderPreRun))
      return Promise.all(statusPromises)
        .then(statuses => {
          // if all children are synced, we are synced
          if (statuses.every(status => status === STATUS.synced)) {
            this.status = STATUS.synced
          } else {
            this.status = STATUS.error
          }
          return this.status
        })
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

    // single file, just sync
    return op(path)
      .then(() => STATUS.synced)
      .catch((err: Error) => {
        this.registry.errorCallback(`[${opName}]: ${err.toString()}`)
        this.status = STATUS.error
        return this.status
      })
      .finally(() => {
        this.registry.rerender()
      })
  }

  download() {
    return this._treeOp(
      'download',
      (pathSegments) => this
        .registry
        .drive
        .promises
        .readFile(pathSegments.join("/"))
        .then((buf) => writeFile(pathSegments.join(path.sep), buf)),
    )
  }

  // recursively syncs current node and children
  // to given drive instance
  sync() {
    return this._treeOp(
      'sync',
      (pathSegments) => {
        const joinedPath = path.join("/")
        return read(joinedPath)
          .then(buf => this
            .registry
            .drive
            .promises
            .writeFile(joinedPath, buf)
          )
      },
    )
  }
}
