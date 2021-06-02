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