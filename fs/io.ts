import fs from 'fs'
import path from 'path'
import {Buffer} from 'buffer'
import speedometer from 'speedometer'

// Helper wrappers around fs package
export const createReadStream = (path: string) => fs.createReadStream(normalizeToSystem(path))
export const createWriteStream = (path: string) => fs.createWriteStream(normalizeToSystem(path))

export function isError(error: any): error is NodeJS.ErrnoException {
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

export interface IStreamPumpStats {
  bytesPerSecond: number;
  totalTransferred: number;
  hasEnded: boolean;
  numTransfers: number;
}
export const pump = async (
  readStream: NodeJS.ReadableStream,
  writeStream: NodeJS.WritableStream,
  statsObject: IStreamPumpStats,
  refreshCallback: () => void,
) => {
  // Reset statsObj entry
  statsObject.bytesPerSecond = 0
  statsObject.totalTransferred = 0
  statsObject.hasEnded = false
  statsObject.numTransfers = 0

  // New pipe
  const speed = speedometer(1)
  return new Promise<void>((resolve, reject) => {
    readStream.pipe(writeStream)
    readStream
      .on('end', () => {
        statsObject.hasEnded = true
        statsObject.bytesPerSecond = 0
        resolve()
      })
      .on('data', (data: Buffer) => {
        statsObject.bytesPerSecond = speed(data.length)
        statsObject.totalTransferred += data.length
        statsObject.numTransfers++
        refreshCallback()
      })
      .on('error', reject)
    writeStream.on('error', reject)
  })
}

// Delete folder
export const rm = async (pathSegments: string[], isDir: boolean) => isDir
  ? fs.promises.rmdir(path.join(...pathSegments), {recursive: true})
  : fs.promises.unlink(path.join(...pathSegments))

// Check if given folder is empty
export const isEmpty = (dir: string) => fs.readdirSync(dir).length === 0

// Path normalization from hyper representation to local
export const normalizeToSystem = (pathLike: string) => pathLike.split('/').join(path.sep)

// Path normalization from local to hyper
export const normalizeToHyper = (pathLike: string) => pathLike.split(path.sep).join('/')
