import path from 'path'
import {read} from './io'
import {registerWatcher} from "./watcher";

export const STATUS = Object.freeze({
  unsynced: "unsynced",
  error: "error",
  synced: "synced",
})

// integrate with
// https://hypercore-protocol.org/guides/walkthroughs/sharing-files-with-hyperdrive/
class TrieNode {
  constructor(key, isDir = false) {
    this.key = key
    this.parent = null
    this.children = {}
    this.status = STATUS.unsynced
    this.isDir = isDir
  }

  getPath() {
    const output = []
    let cur = this
    while (cur.parent !== null) {
      output.unshift(cur.key)
      cur = cur.parent
    }
    return output
  }

  getChildren() {
    return Object.values(this.children)
  }

  sync(drive, errCb) {
    // dont sync already synced files
    if (this.status === STATUS.synced) {
      return this.status
    }

    // if folder, sync all files
    if (this.isDir) {
      const statusPromises = this.getChildren().map(child => child.sync(drive, errCb))
      return Promise.all(statusPromises).then(statuses => {
        // if all children are synced, we are synced
        if (statuses.every(status => status === STATUS.synced)) {
          this.status = STATUS.synced
        } else {
          this.status = STATUS.error
        }
        return this.status
      })
    }

    // single file, just sync
    const path = this.getPath().join("/")
    return read(path)
      .then(buf => drive.promises.writeFile(path, buf))
      .then(() => this.status = STATUS.synced)
      .catch((err) => {
        this.status = STATUS.error
        errCb(err.toString())
      })
      .finally(() => this.status)
  }
}

// actually just a trie
export class Registry {
  constructor(errorCallback) {
    this.root = new TrieNode(null)
    this.drive = undefined
    this.errorCallback = errorCallback
  }

  sync() {
    const promises = this
      .root
      .getChildren()
      .map(child => child.sync(this.drive, this.errorCallback))
    return Promise.all(promises).then(() => this.getTree())
  }

  size() {
    return this.getTree().length
  }

  getTree() {
    const output = []
    const toStringRecur = (indent, node) => {
      if (!node) {
        return
      }

      output.push({
        padding: indent,
        name: node.key,
        isDir: node.isDir,
        status: node.status,
      })
      Object.values(node.children).forEach(child => {
        toStringRecur(indent + 2, child)
      })
    }

    // ignore root node
    Object.values(this.root.children).forEach(child => {
      toStringRecur(0, child)
    })
    return output
  }

  insert(pathSegments, isDir = false) {
    let cur = this.root
    pathSegments.forEach((segment, i) => {
      if (!cur.children[segment]) {
        cur.children[segment] = new TrieNode(segment, true)
        cur.children[segment].parent = cur
      }

      // increment next in trie
      cur = cur.children[segment]
      if (i === pathSegments.length - 1) {
        cur.leaf = true
      }
    })

    // set whether leaf node is directory or not
    cur.isDir = isDir
  }

  // removes an entry from the registry
  // does nothing if node/dir is not present
  remove(pathSegments, isDir = false) {
    const node = this.find(pathSegments)

    // only remove if node is present
    // and is a directory remove on a directory
    if (node && (isDir ? node.isDir : !node.isDir)) {
      const parent = node.parent
      delete parent.children[node.key]
    }
  }

  // attempts to return entry with given path segments
  // returns false if not present
  find(pathSegments) {
    let cur = this.root
    pathSegments.forEach(segment => {
      if (!cur.children[segment]) {
        return false
      }
      cur = cur.children[segment]
    })
    return cur
  }

  parseEvt({ path: targetPath, status, isDir }) {
    const pathSegments = targetPath.split(path.sep)
    switch (status) {
      case 'add':
        this.insert(pathSegments, isDir)
        break
      case 'modify':
        // replace
        // does nothing right now, but might want to
        // add a value prop to trienode later
        break
      case 'delete':
        this.remove(pathSegments, isDir)
        break
    }
  }

  setDrive(drive) {
    this.drive = drive
  }

  watch(dir, onChange, onReady) {
    registerWatcher(dir, data => {
      this.parseEvt(data)
      onChange(data)
    }, onReady)
  }
}