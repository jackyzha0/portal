// watches files and emits events
import chokidar from 'chokidar'
import { readGitIgnore } from "./parse"

export type EventStatus = 'add' | 'modify' | 'delete' | 'genesis'
export interface EventData {
  path: string,
  status: EventStatus,
  isDir: boolean,
}
export type EventCallback = (data: EventData) => void;
export const registerWatcher = (dir: string, onChangeCallback: EventCallback, onReadyCallback = () => {}) => {
  const watcher = chokidar.watch(dir, {
    ignored: readGitIgnore(dir), // ignore dotfiles
    persistent: true,
  })

  const notify = (path: string, status: EventStatus, isDir = false ) => {
    if (path !== ".") {
      onChangeCallback({ path, status, isDir })
    }
  }
  watcher
    .on('add', path => notify(path, 'add'))
    .on('change', path => notify(path, 'modify'))
    .on('addDir', path => notify(path, 'add', true))
    .on('unlink', path => notify(path, 'delete'))
    .on('unlinkDir', path => notify(path, 'delete', true))
    .on('ready', onReadyCallback)
    .on('error', error => console.log(`Watcher error: ${error}`))

  const stop = () => watcher.close().then(() => console.log('closed'));
  return { stop }
}