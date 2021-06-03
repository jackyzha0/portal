import path from 'path'
import {read} from './io'
import {registerWatcher} from "./watcher";

export const STATUS = Object.freeze({
  unsynced: "unsynced",
  error: "error",
  synced: "synced",
})

// single file/folder node
class TrieNode {
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

  // TODO
  download(drive) {

  }

  // recursively syncs current node and children
  // to given drive instance
  sync() {
    // if folder, sync all files
    if (this.isDir) {
      const statusPromises = this.getChildren().map(child => child.sync())
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

    // dont sync already synced files
    if (this.status === STATUS.synced) {
      return Promise.resolve(this.status)
    }

    // single file, just sync
    const path = this.getPath().join("/")
    return read(path)
      .then(buf => this.registry.drive.promises.writeFile(path, buf))
      .then(() => this.status = STATUS.synced)
      .catch((err) => {
        this.status = STATUS.error
        this.registry.errorCallback(`[sync]: ${err.toString()}`)
      })
      .finally(() => {
        this.registry.onChange()
        return this.status
      })
  }
}

// actually just a trie
export class Registry {
  constructor(errorCallback, onChangeCallback) {
    this.root = new TrieNode(this, null)
    this.drive = undefined
    this.errorCallback = errorCallback
    this.onChange = onChangeCallback
  }

  // sync all nodes to drive
  sync() {
    const promises = this
      .root
      .getChildren()
      .map(child => child.sync())
    return Promise.all(promises).then(() => this.getTree())
  }

  size() {
    return this.getTree().length
  }

  // returns pre-order traversal of all nodes
  // in trie
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
      node.getChildren().forEach(child => {
        toStringRecur(indent + 2, child)
      })
    }

    // ignore root node
    this.root.getChildren().forEach(child => {
      toStringRecur(0, child)
    })
    return output
  }

  // insert an entry into the registry
  insert(pathSegments, isDir = false) {
    let cur = this.root
    pathSegments.forEach(segment => {
      if (!cur.children[segment]) {
        cur.children[segment] = new TrieNode(this, segment, true)
        cur.children[segment].parent = cur
      }
      cur = cur.children[segment]
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

  // parse events emitted from fs watcher
  parseEvt({ path: targetPath, status, isDir }) {
    const pathSegments = targetPath.split(path.sep)
    switch (status) {
      case 'add':
        this.insert(pathSegments, isDir)
        break
      case 'modify':
        this.find(pathSegments).status = STATUS.unsynced
        break
      case 'delete':
        this.remove(pathSegments, isDir)
        break
      case 'genesis':
        // hyperdrive key info, ignore
        break
    }
  }

  setDrive(drive) {
    this.drive = drive
  }

  // watch given directory for changes
  watch(dir, onChange, onReady) {
    registerWatcher(dir, data => {
      this.parseEvt(data)
      onChange(data)
      this.onChange()
    }, onReady)
  }
}