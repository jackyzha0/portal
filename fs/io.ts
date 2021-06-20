import fs from 'fs'
import * as path from 'path'

export const read = (path: string) => new Promise<Buffer>((resolve, reject) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      reject(err)
    } else {
      resolve(data)
    }
  })
})

export const writeFile = (pathSegments: string[], buf: Buffer) => {
  fs.writeFileSync(path.join(...pathSegments), buf)
}

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

export const isEmpty = (dir: string) => fs
  .promises
  .readdir(dir)
  .then(files => files.length === 0)