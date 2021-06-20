import path from 'path'
import {EventCallback, EventData, registerWatcher} from "../fs/watcher";
import {STATUS, TrieNode} from "./trie";
import Hyperdrive from "hyperdrive";
import {Feed} from "hyperspace";

// interface representation of renderable version of registry
export interface ITreeRepresentation {
  padding: number,
  name: string,
  isDir: boolean,
  status: STATUS,
}

// Wrapper around trie node to represent a folder and its contents
export class Registry {
  private readonly root: TrieNode;
  private subscribers: EventCallback[];
  errorCallback: (err: string) => void;

  // Remote hyperdrive to sync up to, won't sync if undefined
  drive: Hyperdrive | undefined;

  // Callback to rerender external tree representations on any changes that require
  rerender: () => void;

  constructor() {
    this.root = new TrieNode(this, "")
    this.drive = undefined
    this.errorCallback = () => {}
    this.rerender = () => {}
    this.subscribers = []
  }

  // Set registry error callback
  onError(fn: (err: string) => void) {
    this.errorCallback = fn
    return this
  }

  // Set registry rerender callback
  onRerender(fn: () => void) {
    this.rerender = fn
    return this
  }

  // Subscribe an event to event stream
  addSubscriber(fn: EventCallback) {
    this.subscribers.push(fn)
    return this
  }

  // Set remote hyperdrive
  setDrive(drive: Hyperdrive) {
    this.drive = drive
    return this
  }

  // Sync all nodes to remote
  sync() {
    return this.root.getChildren().map(child => child.sync())
  }

  // Download all files to cwd
  download() {
    return this.root.getChildren().map(child => child.download())
  }

  // Get number of nodes in registry
  size(): number {
    return this.getTree().length
  }

  // Returns a renderable representation of pre-order traversal of all nodes in trie
  getTree(): ITreeRepresentation[] {
    const output: ITreeRepresentation[] = []
    const toStringRecur = (indent: number, node: TrieNode) => {
      // base case: empty trie
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
        // default to indent 2 spaces
        toStringRecur(indent + 2, child)
      })
    }

    // ignore root node, recurse starting at first level
    this.root.getChildren().forEach(child => {
      toStringRecur(0, child)
    })
    return output
  }

  // Insert an entry into the registry
  insert(pathSegments: string[], isDir = false): void {
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
  remove(pathSegments: string[], isDir = false): void {
    const node = this.find(pathSegments)

    // only remove if node is present
    // and is a directory remove on a directory
    if (node && (isDir ? node.isDir : !node.isDir)) {
      const parent = node.parent
      delete parent?.children[node.key]
    }
  }

  update(pathSegments: string[]): void {
    // TODO: implement
  }

  // Attempts to return node at given path. Returns null if not present
  find(pathSegments: string[]): TrieNode | null {
    return pathSegments.reduce((cur: TrieNode | null, segment) => {
      // if child not found or parent was also not found, return null
      if (!cur || !(cur.children && cur.children[segment])) {
        return null
      }

      // next path segment
      return cur.children[segment]
    }, this.root)
  }

  // Parse event data emitted from fs watcher to modify trie
  parseEvt({ path: targetPath, status, isDir }: EventData) {
    // ignore genesis block (only contains hyperdrive info)
    if (status === 'genesis') return

    const pathSegments = targetPath.split(path.sep)
    switch (status) {
      case 'add':
        this.insert(pathSegments, isDir)
        break
      case 'modify':
        // TODO: refactor to use update()
        const modNode = this.find(pathSegments)
        if (modNode) {
          modNode.status = STATUS.unsynced
        }
        break
      case 'delete':
        this.remove(pathSegments, isDir)
        break
    }
  }

  _onChangeCallback(data: EventData) {
    this.parseEvt(data)
    this.subscribers.forEach(fn => fn(data))
    this.rerender()
  }

  // Watch directory for changes and link to internal onChange handler
  watch(dir: string, onReady: () => void) {
    registerWatcher(
      dir,
      data => this._onChangeCallback(data),
      onReady,
    )
    return this
  }

  // Subscribe to remote eventLog hypercore feed
  subscribeRemote(eventLog: Feed, onReady: () => void) {
    const process = (data: string) => {
      this._onChangeCallback(JSON.parse(data) as EventData)
    }

    // reconstruct file registry from event stream
    const dataPromises = []
    for (let i = 1; i < eventLog.length; i++) {
      dataPromises.push(eventLog.get(i))
    }
    Promise.all(dataPromises)
      .then(data => data.forEach(process))
      .then(() => onReady())

    // TODO: handle more feed events here
    // https://github.com/hypercore-protocol/hypercore#feedondownload-index-data
    eventLog.on('append', async () => {
      const data = await eventLog.get(eventLog.length - 1)
      process(data)
    })
    eventLog.on('close', () => {
      console.log('stream closed')
    })
    return this
  }
}