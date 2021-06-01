// parses gitignores
import fs from 'fs'
import path from 'path'
import parse from 'parse-gitignore'

const getAllGitIgnores = (dir) => {
  const res = []
  const recur = (searchDir) => {
    fs.readdirSync(searchDir).forEach(file => {
      const absPath = path.join(searchDir, file)
      if (fs.statSync(absPath).isDirectory()) {
        recur(absPath)
      } else {
        if (file === '.gitignore') {
          res.push({
            path: absPath,
            prefix: searchDir,
          })
        }
      }
    })
  }
  recur(dir)
  return res
}

export const readGitIgnore = (providedPath) => {
  const filePaths = ['.git']
  try {
    const resolved = path.resolve(providedPath)
    const ignoredFiles = getAllGitIgnores(providedPath)
      .map(gitIgnore => {
        const fullPath = path.join(resolved, gitIgnore.path)
        const allIgnored = [...parse(fs.readFileSync(fullPath)), '.git']
        return allIgnored.map(ignoredFile => path.join(gitIgnore.prefix, ignoredFile))
      })
      .flat()
    filePaths.push(...ignoredFiles)
    return filePaths
  } catch {
    return filePaths
  }
}
