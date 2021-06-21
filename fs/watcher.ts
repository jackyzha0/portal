import chokidar from 'chokidar'
import {readGitIgnore} from './parse'

// Different event statuses
// genesis is reserved for initial eventLog block for discovery key
export type EventStatus = 'add' | 'modify' | 'delete' | 'genesis'

// Event emitted from file watcher
export interface EventData {
  path: string;
  status: EventStatus;
  isDir: boolean;
}

// Callback that acts on event data
export type EventCallback = (data: EventData) => void

// Register a file watcher at given directory
export const registerWatcher = (
  dir: string,
  onChangeCallback: EventCallback,
  ignoreGitFiles: boolean,
  onReadyCallback = () => {}
) => {
  const watcher = chokidar.watch(dir, {
    ignored: readGitIgnore(dir, ignoreGitFiles),
    persistent: true
  })

  const notify = (path: string, status: EventStatus, isDir = false) => {
    // ignore .
    if (path !== '.') {
      onChangeCallback({path, status, isDir})
    }
  }

  // Register events
  watcher
    .on('add', path => {
      notify(path, 'add')
    })
    .on('change', path => {
      notify(path, 'modify')
    })
    .on('addDir', path => {
      notify(path, 'add', true)
    })
    .on('unlink', path => {
      notify(path, 'delete')
    })
    .on('unlinkDir', path => {
      notify(path, 'delete', true)
    })
    .on('ready', onReadyCallback)
    .on('error', error => {
      console.log(`Watcher error: ${error.message}`)
    })

  const stop = async () => watcher.close().then(() => {
    console.log('closed')
  })
  return {stop}
}
