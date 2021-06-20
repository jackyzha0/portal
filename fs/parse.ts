// parses gitignores
import fs from 'fs'
import path from 'path'
import parse from 'parse-gitignore'

interface IGitIgnoreResult {
  path: string,
  prefix: string,
}

// returns relative path of all .gitignore files in current directory
const getAllGitIgnores = (dir: string): IGitIgnoreResult[] => {
  const res: IGitIgnoreResult[] = []
  const recur = (searchDir: string) => {
    fs.readdirSync(searchDir).forEach(file => {
      const absPath = path.join(searchDir, file)
      if (fs.existsSync(absPath)) {
        const stat = fs.statSync(absPath)
        if (stat.isDirectory()) {
          recur(absPath)
        } else if (stat.isFile()) {
          if (file === '.gitignore') {
            res.push({
              path: absPath,
              prefix: searchDir,
            })
          }
        }
      }
    })
  }
  recur(dir)
  return res
}

export const readGitIgnore = (providedPath: string) => {
  // TODO: make this flag enabled
  const filePaths: string[] = ['.git']
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
}
