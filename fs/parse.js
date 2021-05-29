// parses gitignores
import fs from 'fs'
import path from 'path'
import parse from 'parse-gitignore'

export const readGitIgnore = (providedPath) => {
  const resolved = path.resolve(providedPath)
  const filePaths = parse(fs.readFileSync(`${resolved}/.gitignore`))
  filePaths.push('.git')
  return filePaths
}

