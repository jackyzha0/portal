import fs from 'fs'
import path from 'path'
import parse from 'parse-gitignore'

interface IGitIgnoreResult {
  // absolute path to .gitignore
  path: string,

  // folder containing .gitignore
  prefix: string,
}

// Returns relative path of all .gitignore files in given directory
const getAllGitIgnores = (dir: string): IGitIgnoreResult[] => {
  const res: IGitIgnoreResult[] = []
  const recur = (searchDir: string) => {
    fs.readdirSync(searchDir).forEach(file => {
      const absPath = path.join(searchDir, file)

      // only open if file actually exists on disk
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

// Read .gitignore at given path and return all ignored patterns
export const readGitIgnore = (providedPath: string) => {
  // TODO: make this flag enabled
  // default to ignoring .git files
  const filePaths: string[] = ['.git']

  // parse path from string
  const resolved = path.resolve(providedPath)
  const ignoredFiles = getAllGitIgnores(providedPath)
    .map(gitIgnore => {
      // construct absolute path
      const fullPath = path.join(resolved, gitIgnore.path)
      // read file and get all ignored patterns
      const allIgnored = [...parse(fs.readFileSync(fullPath)), '.git']
      // add prefixes to all ignored patterns
      return allIgnored.map(ignoredFile => path.join(gitIgnore.prefix, ignoredFile))
    })
    .flat()
  filePaths.push(...ignoredFiles)
  return filePaths
}
