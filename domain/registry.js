import path from 'path'
import {registerWatcher} from "../fs/watcher";
import {TrieNode} from "./trie";

export const STATUS = Object.freeze({
  unsynced: "unsynced",
  error: "error",
  synced: "synced",
})

export class Registry {
  constructor() {
    this.root = new TrieNode(this, null)
    this.drive = undefined
    this.errorCallback = () => {}
    this.rerender = () => {}
    this.subscribers = []
  }

  // registy error callback
  onError(fn) {
    this.errorCallback = fn
    return this
  }

  onRerender(fn) {
    this.rerender = fn
    return this
  }

  // add subscriber to event stream
  addSubscriber(fn) {
    this.subscribers.push(fn)
    return this
  }

  // set remote hyperdrive
  setDrive(drive) {
    this.drive = drive
    return this
  }

  sync() {
    return this.root.getChildren().map(child => child.sync(this.drive, this.errorCallback))
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
    this.subscribers.forEach(fn => fn(data))
    this.rerender()
  }

  // watch local directory for changes
  watch(dir, onReady) {
    registerWatcher(
      dir,
      data => this._onChangeCallback(data),
      onReady,
    )
    return this
  }

  // subscribe to remote eventLog hypercore feed
  subscribeRemote(eventLog, onReady) {
    eventLog.download()
    const process = (data) => {
      this._onChangeCallback(JSON.parse(data))
      this.rerender()
    }

    // reconstruct file registry from event stream
    const dataPromises = []
    for (let i = 0; i < eventLog.length; i++) {
      dataPromises.push(eventLog.get(i))
    }

    Promise.all(dataPromises)
      .then(data => data.forEach(process))
      .then(() => onReady())

    // TODO: handle more feed events here
    // https://github.com/hypercore-protocol/hypercore#feedondownload-index-data
    eventLog
      .on('append', async () => {
        const data = await eventLog.get(eventLog.length - 1)
        process(data)
      })
      .on('close', () => {
        console.log('stream closed')
      })
    return this
  }
}