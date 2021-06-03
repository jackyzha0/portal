import fs from 'fs'

export const read = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      reject(err)
    } else {
      resolve(data)
    }
  })
})

export const isEmpty = (dir) => fs
  .promises
  .readdir(dir)
  .then(files => files.length === 0)