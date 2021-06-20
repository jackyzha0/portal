import fs from 'fs'
import * as path from 'path'

// Read file at path and return buffer
export const read = (path: string) => new Promise<Buffer>((resolve, reject) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      reject(err)
    } else {
      resolve(data)
    }
  })
})

// Write current buffer to location of given path segment
export const writeFile = (pathSegments: string[], buf: Buffer) => new Promise<void>((resolve, reject) => {
  fs.writeFile(path.join(...pathSegments), buf, (err) => {
    if (err) {
      reject(err)
    } else {
      resolve()
    }
  })
})

// Creates folder at current location
export const mkdir = (pathSegments: string[]) => {
  try {
    fs.mkdirSync(path.join(...pathSegments))
  } catch (err) {
    // ignore if it already exists
    if (err.code !== 'EEXIST') {
      throw err
    }
  }
}

// Check if given folder is empty
export const isEmpty = (dir: string) => fs
  .promises
  .readdir(dir)
  .then(files => files.length === 0)