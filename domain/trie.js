// single file/folder node
import {read, writeFile} from "../fs/io";
import {STATUS} from "./registry";
import * as path from "path";

export class TrieNode {
  constructor(registry, key, isDir = false) {
    this.key = key
    this.parent = null
    this.children = {}
    this.registry = registry
    this.status = STATUS.unsynced
    this.isDir = isDir
  }

  traverse() {
    const output = []
    let cur = this

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

  _treeOp(op, opName, applyPromise, folderPreRun = () => {}) {
    const path = this.getPath()

    const handlePromise = promise => promise
      .catch((err) => {
        this.status = STATUS.error
        this.registry.errorCallback(`[${opName}]: ${err.toString()}`)
      })
      .finally(() => {
        this.registry.rerender()
        return this.status
      })

    // if folder, apply op to all files
    if (this.isDir) {
      // do something with current path if necessary
      folderPreRun(path)
      const statusPromises = this.getChildren().map(op)
      return handlePromise(Promise.all(statusPromises)
        .then(statuses => {
          // if all children are synced, we are synced
          console.log(statuses)
          if (statuses.every(status => status === STATUS.synced)) {
            this.status = STATUS.synced
          } else {
            this.status = STATUS.error
          }
        }))
    }

    // dont apply op to already synced files
    if (this.status === STATUS.synced) {
      return Promise.resolve(this.status)
    }

    // single file, just sync
    return handlePromise(applyPromise(path).then(() => this.status = STATUS.synced))
  }

  download() {
    return this._treeOp(
      child => child.download(),
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
      child => child.sync(),
      'sync',
      (path) => {
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
