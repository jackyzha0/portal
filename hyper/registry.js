import path from 'path'

class TrieNode {
  constructor(key, isDir = false) {
    this.key = key
    this.parent = null
    this.children = {}
    this.leaf = false
    this.isDir = isDir
  }

  getPath() {
    const output = []
    let cur = this
    while (cur !== null) {
      output.unshift(cur.key)
      cur = cur.parent
    }
    return output
  }
}

// actually just a trie
export class Registry {
  constructor() {
    this.root = new TrieNode(null)
  }

  toString() {
    const output = []
    const toStringRecur = (indent, node) => {
      if (!node) {
        return
      }

      const padding = " ".repeat(indent)
      output.push(`${padding}${node.key}${node.isDir ? '/' : ''}`)
      Object.values(node.children).forEach(child => {
        toStringRecur(indent + 2, child)
      })
    }

    // ignore root node
    Object.values(this.root.children).forEach(child => {
      toStringRecur(0, child)
    })
    return output.join("\n")
  }

  insert(pathSegments, isDir = false) {
    let cur = this.root
    pathSegments.forEach((segment, i) => {
      if (!cur.children[segment]) {
        cur.children[segment] = new TrieNode(segment, true)
        cur.children[segment].parent = cur
      }

      // increment next in trie
      cur = cur.children[segment]
      if (i === pathSegments.length - 1) {
        cur.leaf = true
      }
    })

    // set whether leaf node is directory or not
    cur.isDir = isDir
  }

  remove(pathSegments) {
    if (this.contains(pathSegments)) {
      const node = this.find(pathSegments)

    }
  }

  find(pathSegments) {
    let cur = this.root
    pathSegments.forEach(segment => {
      if (!cur.children[segment]) {
        return false
      }
      cur = cur.children[segment]
    })
    return cur
  }

  contains(pathSegments) {
    return this.find(pathSegments)?.leaf ?? false
  }

  parseEvt({ targetPath, status, isDir }) {
    const pathSegments = targetPath.split(path.sep)
    switch (status) {
      case 'add':
        this.insert(pathSegments, isDir)
        break
      case 'modify':
        break
      case 'delete':
        break
    }
  }
}

const registry = new Registry()
registry.insert("/asdfasdf.dat".split(path.sep))
registry.insert("/nested/deep/random.dat".split(path.sep))
registry.insert("/nested/deep/random2.dat".split(path.sep))
registry.insert("/abc/test.txt".split(path.sep))

console.log(registry.toString())