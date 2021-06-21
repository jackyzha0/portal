import path from 'path'
import Hyperdrive from 'hyperdrive'
import {Feed} from 'hyperspace'
import {EventCallback, EventData, registerWatcher} from '../fs/watcher'
import {STATUS, TrieNode} from './trie'

// Interface representation of renderable version of registry
export interface ITreeRepresentation {
  padding: number;
  name: string;
  isDir: boolean;
  status: STATUS;
}

// Wrapper around trie node to represent a folder and its contents
export class Registry {
  // Remote hyperdrive to sync up to, won't sync if undefined
  drive: Hyperdrive | undefined

  // Callback to rerender external tree representations on any changes that require
  rerender: () => void
  errorCallback: (error: string) => void

  private readonly root: TrieNode
  private readonly subscribers: Map<string, EventCallback>

  constructor() {
    this.root = new TrieNode(this, '')
    this.drive = undefined
    this.errorCallback = () => {}
    this.rerender = () => {}
    this.subscribers = new Map()
  }

  // Set registry error callback
  onError(fn: (error: string) => void) {
    this.errorCallback = fn
    return this
  }

  // Set registry rerender callback
  onRerender(fn: () => void) {
    this.rerender = fn
    return this
  }

  // Subscribe an event to event stream
  addSubscriber(name: string, fn: EventCallback) {
    this.subscribers.set(name, fn)
    return this
  }

  // Remove a subscriber from event stream
  removeSubscriber(name: string) {
    this.subscribers.delete(name)
  }

  // Set remote hyperdrive
  setDrive(drive: Hyperdrive) {
    this.drive = drive
    return this
  }

  // Sync all nodes to remote
  sync() {
    return this.root.getChildren().map(async child => child.sync())
  }

  // Download all files to cwd
  download() {
    return this.root.getChildren().map(async child => child.download())
  }

  // Get number of nodes in registry
  size(): number {
    return this.getTree().length
  }

  // Returns a renderable representation of pre-order traversal of all nodes in trie
  getTree(): ITreeRepresentation[] {
    const output: ITreeRepresentation[] = []
    const toStringRecur = (indent: number, node: TrieNode) => {
      // Base case: empty trie
      if (!node) {
        return
      }

      output.push({
        padding: indent,
        name: node.key,
        isDir: node.isDir,
        status: node.status
      })
      for (const child of node.getChildren()) {
        // Default to indent 2 spaces
        toStringRecur(indent + 2, child)
      }
    }

    // ignore root node, recurse starting at first level
    for (const child of this.root.getChildren()) {
      toStringRecur(0, child)
    }

    return output
  }

  // Insert an entry into the registry
  insert(pathSegments: string[], isDir = false): void {
    let cur = this.root
    for (const segment of pathSegments) {
      if (!cur.children[segment]) {
        cur.children[segment] = new TrieNode(this, segment, true)
        cur.children[segment].parent = cur
      }

      cur = cur.children[segment]
    }

    // Set whether leaf node is directory or not
    cur.isDir = isDir
  }

  // Removes an entry from the registry
  // does nothing if node/dir is not present
  remove(pathSegments: string[], isDir = false): void {
    const node = this.find(pathSegments)

    // Only remove if node is present
    // and is a directory remove on a directory
    if (node && (isDir ? node.isDir : !node.isDir)) {
      const {parent} = node
      delete parent?.children[node.key]
    }
  }

  // Attempts to return node at given path. Returns null if not present
  find(pathSegments: string[]): TrieNode | null {
    return pathSegments.reduce((cur: TrieNode | null, segment) => {
      // If child not found or parent was also not found, return null
      if (!cur?.children?.[segment]) {
        return null
      }

      // Next path segment
      return cur.children[segment]
    }, this.root)
  }

  update(pathSegments: string[]) {
    const modNode = this.find(pathSegments)
    if (modNode) {
      modNode.traverse().forEach(node => node.status = STATUS.unsynced)
    }
  }

  // Parse event data emitted from fs watcher to modify trie
  parseEvt({path: targetPath, status, isDir}: EventData) {
    const pathSegments = targetPath.split(path.sep)
    switch (status) {
      case 'add':
        this.insert(pathSegments, isDir)
        break
      case 'modify':
        this.update(pathSegments)
        break
      case 'delete':
        this.remove(pathSegments, isDir)
        break
      case 'genesis':
      default:
        // ignore genesis block (only contains hyperdrive info)
        break
    }
  }

  _onChangeCallback(data: EventData) {
    this.parseEvt(data)
    for (const fn of this.subscribers.values()) {
      fn(data)
    }

    this.rerender()
  }

  // Watch directory for changes and link to internal onChange handler
  watch(dir: string, onReady: () => void) {
    registerWatcher(
      dir,
      data => {
        this._onChangeCallback(data)
      },
      onReady
    )
    return this
  }

  // Subscribe to remote eventLog hypercore feed
  subscribeRemote(eventLog: Feed, onReady: () => void) {
    const process = (data: string) => {
      this._onChangeCallback(JSON.parse(data) as EventData)
    }

    // Reconstruct file registry from event stream
    const dataPromises = []
    for (let i = 1; i < eventLog.length; i++) {
      dataPromises.push(eventLog.get(i))
    }

    Promise.all(dataPromises)
      .then(data => {
        data.forEach(process)
      })
      .then(() => {
        onReady()
      })
      .catch((error: Error) => {
        this.errorCallback(`[subscribe]: ${error.message}`)
      })

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
