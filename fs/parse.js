// parses gitignores
import fs from 'fs'
import path from 'path'
import parse from 'parse-gitignore'

export const readGitIgnore = (providedPath) => {
  const filePaths = ['.git']
  try {
    const resolved = path.resolve(providedPath)
    filePaths.push(...parse(fs.readFileSync(`${resolved}/.gitignore`)))
    return filePaths
  } catch {
    return filePaths
  }
}
