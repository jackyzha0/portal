import path from 'path'
import {EventCallback, EventData, registerWatcher} from "../fs/watcher";
import {TrieNode} from "./trie";
import Hyperdrive from "hyperdrive";
import {Feed} from "hyperspace";

export enum STATUS {
  unsynced,
  error,
  synced,
}

export interface ITreeRepresentation {
  padding: number,
  name: string,
  isDir: boolean,
  status: STATUS,
}

export class Registry {
  private readonly root: TrieNode;
  drive: Hyperdrive | undefined;
  errorCallback: (err: string) => void;
  rerender: () => void;
  private subscribers: EventCallback[];

  constructor() {
    this.root = new TrieNode(this, "")
    this.drive = undefined
    this.errorCallback = () => {}
    this.rerender = () => {}
    this.subscribers = []
  }

  // registry error callback
  onError(fn: (err: string) => {}) {
    this.errorCallback = fn
    return this
  }

  onRerender(fn: () => void) {
    this.rerender = fn
    return this
  }

  // add subscriber to event stream
  addSubscriber(fn: EventCallback) {
    this.subscribers.push(fn)
    return this
  }

  // set remote hyperdrive
  setDrive(drive: Hyperdrive) {
    this.drive = drive
    return this
  }

  sync() {
    return this.root.getChildren().map(child => child.sync())
  }

  download() {
    return this.root.getChildren().map(child => child.download())
  }

  size(): number {
    return this.getTree().length
  }

  // returns pre-order traversal of all nodes
  // in trie
  getTree(): ITreeRepresentation[] {
    const output: ITreeRepresentation[] = []
    const toStringRecur = (indent: number, node: TrieNode) => {
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

  // attempts to return entry with given path segments
  // returns false if not present
  find(pathSegments: string[]): TrieNode | null {
    return pathSegments.reduce((cur: TrieNode | null, segment) => {
      if (!cur || !(cur.children && cur.children[segment])) {
        return null
      }
      return cur.children[segment]
    }, this.root)
  }

  // parse events emitted from fs watcher
  parseEvt({ path: targetPath, status, isDir }: EventData) {
    if (status === 'genesis') return
    const pathSegments = targetPath.split(path.sep)
    switch (status) {
      case 'add':
        this.insert(pathSegments, isDir)
        break
      case 'modify':
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

  // watch local directory for changes
  watch(dir: string, onReady: () => void) {
    registerWatcher(
      dir,
      data => this._onChangeCallback(data),
      onReady,
    )
    return this
  }

  // subscribe to remote eventLog hypercore feed
  subscribeRemote(eventLog: Feed, onReady: () => void) {
    const process = (data: string) => {
      this._onChangeCallback(JSON.parse(data) as EventData)
      this.rerender()
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