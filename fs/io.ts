import fs from 'fs'
import path from 'path'

// Read file at path and return buffer
// TODO: refactor to use readstream: https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options
export const read = async (path: string) => new Promise<Buffer>((resolve, reject) => {
  fs.readFile(path, (error, data) => {
    if (error) {
      reject(error)
    } else {
      resolve(data)
    }
  })
})

// Write current buffer to location of given path segment
// TODO: refactor to use writestream
export const writeFile = async (pathSegments: string[], buf: Buffer) => new Promise<void>((resolve, reject) => {
  fs.writeFile(path.join(...pathSegments), buf, error => {
    if (error) {
      reject(error)
    } else {
      resolve()
    }
  })
})

function isError(error: any): error is NodeJS.ErrnoException {
  return error instanceof Error
}

// Creates folder at current location
export const mkdir = (pathSegments: string[]) => {
  try {
    fs.mkdirSync(path.join(...pathSegments))
  } catch (error: unknown) {
    // ignore if it already exists
    if (isError(error) && error.code !== 'EEXIST') {
      throw error
    }
  }
}

// Check if given folder is empty
export const isEmpty = (dir: string) => fs.readdirSync(dir).length === 0
