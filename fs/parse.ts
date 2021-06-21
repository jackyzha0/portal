import fs from 'fs'
import path from 'path'
import parse from 'parse-gitignore'

interface IGitIgnoreResult {
  // Absolute path to .gitignore
  path: string;

  // Folder containing .gitignore
  prefix: string;
}

// Returns relative path of all .gitignore files in given directory
const getAllGitIgnores = (dir: string): IGitIgnoreResult[] => {
  const result: IGitIgnoreResult[] = []
  const recur = (searchDir: string) => {
    for (const file of fs.readdirSync(searchDir)) {
      const absPath = path.join(searchDir, file)

      // Only open if file actually exists on disk
      if (fs.existsSync(absPath)) {
        const stat = fs.statSync(absPath)
        if (stat.isDirectory()) {
          recur(absPath)
        } else if (stat.isFile() && file === '.gitignore') {
          result.push({
            path: absPath,
            prefix: searchDir
          })
        }
      }
    }
  }

  recur(dir)
  return result
}

// Read .gitignore at given path and return all ignored patterns
export const readGitIgnore = (providedPath: string, ignoreGitFiles: boolean) => {
  // Default to ignoring .git files
  const filePaths: string[] = ignoreGitFiles ? ['.git'] : []

  // Parse path from string
  const resolved = path.resolve(providedPath)
  const ignoredFiles = getAllGitIgnores(providedPath)
    .flatMap(gitIgnore => {
      // Construct absolute path
      const fullPath = path.join(resolved, gitIgnore.path)
      // Read file and get all ignored patterns
      const allIgnored = [...parse(fs.readFileSync(fullPath))]
      if (ignoreGitFiles) {
        allIgnored.push('.git')
      }

      // Add prefixes to all ignored patterns
      return allIgnored.map(ignoredFile => path.join(gitIgnore.prefix, ignoredFile))
    })

  filePaths.push(...ignoredFiles)
  return filePaths
}
