import chokidar from 'chokidar'
import {readGitIgnore} from './parse'
import {normalizeToHyper} from './io'

// Different event statuses
// genesis is reserved for initial eventLog block for discovery key
export type EventStatus = 'add' | 'modify' | 'delete' | 'genesis'

// Event emitted from file watcher
export interface EventData {
  path: string;
  status: EventStatus;
  isDir: boolean;
  newSize?: number;
}

// Callback that acts on event data
export type EventCallback = (data: EventData) => void

// Register a file watcher at given directory
export function registerWatcher(
  dir: string,
  ignoreGitFiles: boolean,
  callbacks: {
    onErrorCallback: (error: string) => void;
    onChangeCallback: EventCallback;
    onReadyCallback: () => void;
  },
) {
  const {onErrorCallback, onChangeCallback, onReadyCallback} = callbacks
  const watcher = chokidar.watch(dir, {
    ignored: readGitIgnore(dir, ignoreGitFiles),
    persistent: true,
  })

  const notify = (path: string, status: EventStatus, isDir: boolean, newSize?: number) => {
    // ignore .
    if (path !== '.') {
      const normalizedPath = normalizeToHyper(path)
      onChangeCallback({
        path: normalizedPath,
        status,
        isDir,
        newSize,
      })
    }
  }

  // Register events
  watcher
    .on('add', (path, stat) => {
      notify(path, 'add', false, stat?.size)
    })
    .on('change', (path, stat) => {
      notify(path, 'modify', false, stat?.size)
    })
    .on('addDir', path => {
      notify(path, 'add', true)
    })
    .on('unlink', path => {
      notify(path, 'delete', false)
    })
    .on('unlinkDir', path => {
      notify(path, 'delete', true)
    })
    .on('ready', onReadyCallback)
    .on('error', (error: Error) => {
      onErrorCallback(`[watcher]: ${error.message}`)
    })
}
