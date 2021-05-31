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

  getTree() {
    const output = []
    const toStringRecur = (indent, node) => {
      if (!node) {
        return
      }

      const padding = " ".repeat(indent)
      output.push({
        padding: padding,
        name: node.key,
        isDir: node.isDir,
      })
      Object.values(node.children).forEach(child => {
        toStringRecur(indent + 2, child)
      })
    }

    // ignore root node
    Object.values(this.root.children).forEach(child => {
      toStringRecur(0, child)
    })
    return output
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

  // removes an entry from the registry
  // does nothing if node/dir is not present
  remove(pathSegments, isDir = false) {
    const node = this.find(pathSegments)

    // only remove if node is present
    // and is a directory remove on a directory
    if (node && (isDir ? node.isDir : !node.isDir)) {
      const parent = node.parent
      delete parent.children[node.key]
    }
  }

  // attempts to return entry with given path segments
  // returns false if not present
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

  // returns whether path segment is a leaf in the registry
  contains(pathSegments) {
    return this.find(pathSegments)?.leaf ?? false
  }

  parseEvt({ path: targetPath, status, isDir }) {
    const pathSegments = targetPath.split(path.sep)
    switch (status) {
      case 'add':
        this.insert(pathSegments, isDir)
        break
      case 'modify':
        // replace
        // does nothing right now, but might want to
        // add a value prop to trienode later
        break
      case 'delete':
        this.remove(pathSegments, isDir)
        break
    }
  }
}
