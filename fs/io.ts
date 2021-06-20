import fs from 'fs'
import path from 'path'

export const read = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      reject(err)
    } else {
      resolve(data)
    }
  })
})

export const writeFile = (pathSegments, buf) => {
  fs.writeFileSync(path.join(pathSegments), buf)
}

export const mkdir = (pathSegments) => {
  try {
    fs.mkdirSync(path.join(pathSegments))
  } catch (e) {
    // ignore if it already exists
    if (err.code !== 'EEXIST') {
      throw err
    }
  }
}

export const isEmpty = (dir) => fs
  .promises
  .readdir(dir)
  .then(files => files.length === 0)