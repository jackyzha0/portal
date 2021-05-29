// watches files and emits events
import chokidar from 'chokidar'
import { readGitIgnore } from "./parse.js"

const registerWatcher = (dir) => {
  const watcher = chokidar.watch(dir, {
    ignored: readGitIgnore(dir), // ignore dotfiles
    persistent: true
  })

  watcher
    .on('add', path => console.log(`File ${path} has been added`))
    .on('change', path => console.log(`File ${path} has been changed`))
    .on('unlink', path => console.log(`File ${path} has been removed`));
}

registerWatcher('.')