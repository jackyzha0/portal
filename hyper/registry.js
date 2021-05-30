import path from 'path'

class TrieNode {
  constructor(key) {
    this.key = key
    this.parent = null
    this.children = {}
    this.leaf = false
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

  upsert(pathSegments) {
    let cur = this.root
    pathSegments.forEach((segment, i) => {
      if (!cur.children[segment]) {
        cur.children[segment] = new TrieNode(segment)
        cur.children[segment].parent = cur
      }

      // increment next in trie
      cur = cur.children[segment]
      if (i === pathSegments.length - 1) {
        cur.leaf = true
      }
    })
  }

  contains(pathSegments) {
    let cur = this.root
    pathSegments.forEach((segment, i) => {
      if (!cur.children[segment]) {
        return false
      }
      cur = cur.children[segment]
    })
    return cur.leaf
  }

  // parseEvt({ targetPath, status, isDir }) {
  //   const pathSegments = targetPath.split(path.sep)
  //   switch (status) {
  //
  //   }
  // }
}

const registry = new Registry()
registry.upsert("/test".split(path.sep))
registry.upsert("/test/abc.dat".split(path.sep))
registry.upsert("/cde.dat".split(path.sep))

console.log(registry.contains("/test".split(path.sep)))
console.log(registry.contains("/asdfasdf".split(path.sep)))
console.log(registry.contains("/test/abc.dat".split(path.sep)))