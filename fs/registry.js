import path from 'path'
import {read, writeFile} from './io'
import {registerWatcher} from "./watcher";
import join from "../commands/join";

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

  _treeOp(op, opName, applyPromise, folderPreRun = () => {}) {
    const path = this.getPath()

    // if folder, apply op to all files
    if (this.isDir) {
      // do something with current path if necessary
      folderPreRun(path)
      const statusPromises = this.getChildren().map(op)
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

    // dont apply op to already synced files
    if (this.status === STATUS.synced) {
      return Promise.resolve(this.status)
    }

    // single file, just sync
    return applyPromise(path)
      .then(() => this.status = STATUS.synced)
      .catch((err) => {
        this.status = STATUS.error
        this.registry.errorCallback(`[${opName}]: ${err.toString()}`)
      })
      .finally(() => {
        this.registry.onChange()
        return this.status
      })
  }

  download() {
    return this._treeOp(
      child => child.download(),
      'download',
      (path) => this
        .registry
        .drive
        .promises
        .readFile(path.join("/"))
        .then((buf) => writeFile(path, buf)),
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

// actually just a trie
export class Registry {
  constructor() {
    this.root = new TrieNode(this, null)
    this.drive = undefined
    this.errorCallback = () => {}
    this.onChange = () => {}
  }

  onError(fn) {
    this.errorCallback = fn
    return this
  }

  onChange(fn) {
    this.onChange = fn
    return this
  }

  setDrive(drive) {
    this.drive = drive
    return this
  }

  _treeOp(fn) {
    const promises = this
      .root
      .getChildren()
      .map(fn)
    return Promise.all(promises).then(() => this.getTree())
  }

  // sync all nodes to drive
  sync() {
    return this._treeOp(child => child.sync())
  }

  // download all nodes to given directory
  download(dir) {
    return this._treeOp(child => child.download(dir))
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
    if (status === 'genesis') return
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
    }
  }

  _onChangeCallback(data) {
    this.parseEvt(data)
    this.onChange(data)
  }

  // watch local directory for changes
  watch(dir, onReady) {
    registerWatcher(
      dir,
      data => this._onChangeCallback(data),
      onReady,
    )
  }

  // subscribe to remote eventLog hypercore feed
  subscribe(eventLog, onChange, onReady) {
    // reconstruct file registry from event stream
    const dataPromises = []
    for (let i = 0; i < eventLog.length; i++) {
      dataPromises.push(eventLog.get(i))
    }

    const process = (data) => this._onChangeCallback(JSON.parse(data), onChange)
    Promise.all(dataPromises)
      .then(data => data.forEach(process))
      .then(() => {
        // if we get a new block
        eventLog.on('append', async () => {
          const data = await eventLog.get(eventLog.length - 1)
          process(data)
        })

        eventLog.on('close', () => {
          console.log('stream closed')
        })

        // TODO: handle more feed events here
        // https://github.com/hypercore-protocol/hypercore#feedondownload-index-data
      })
      .then(() => onReady())
  }
}