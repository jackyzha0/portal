// watches files and emits events
import chokidar from 'chokidar'
import { readGitIgnore } from "./parse.js"

export const registerWatcher = (dir, onChangeCallback) => {
  console.log('starting file watcher...')
  const watcher = chokidar.watch(dir, {
    ignored: readGitIgnore(dir), // ignore dotfiles
    persistent: true,
  })

  const notify = (path, status, isDir = false) => {
    onChangeCallback({ path, status, isDir })
  }

  watcher
    .on('add', path => notify(path, 'add'))
    .on('change', path => notify(path, 'modify'))
    .on('unlink', path => notify(path, 'delete'))
    .on('addDir', path => notify(path, 'add', true))
    .on('unlinkDir', path => notify(path, 'delete', true))
    .on('ready', () => console.log('Initial scan complete. Ready for changes'))
    .on('error', error => console.log(`Watcher error: ${error}`))

  const stop = () => watcher.close().then(() => console.log('closed'));
  return { stop  }
}