import anyTest, {ExecutionContext, TestInterface} from 'ava'
import {Registry} from '../domain/registry'
import {STATUS} from '../domain/trie'

// Helpers
const test = anyTest as TestInterface<{reg: Registry}>
test.beforeEach(t => {
  t.context.reg = new Registry()
})

const complexTree = (r: Registry) => {
  r.insert(['a', 'b', 'c.txt'])
  r.insert(['a', 'b', 'd.txt'])
  r.insert(['a', 'b', 'e', 'f.txt'])
  r.insert(['a', 'g.txt'])
  r.insert(['h.txt'])
  return r
}

type NodeAssertion = (t: ExecutionContext, r: Registry, pathSegments: string[]) => void
const nodeNotPresent: NodeAssertion = (t, r, pathSegments) => {
  t.falsy(r.find(pathSegments))
}

const nodePresent: NodeAssertion = (t, r, pathSegments) => {
  t.truthy(r.find(pathSegments))
}

// Find() tests
test('find() - empty root', t => {
  const r = t.context.reg
  nodeNotPresent(t, r, ['test'])
  nodePresent(t, r, [])
})

test('find() - file at root', t => {
  const r = t.context.reg
  const path = ['test']
  nodeNotPresent(t, r, path)
  r.insert(path)
  nodePresent(t, r, path)
})

test('find() - file not present', t => {
  const r = t.context.reg
  r.insert(['test'])
  nodeNotPresent(t, r, ['test', 'notPresent'])
  nodeNotPresent(t, r, ['alsoNotPresent'])
})

// Insert() tests
test('insert() - nested file', t => {
  const r = t.context.reg
  const path = ['folder', 'inner', 'test.txt']
  r.insert(path)
  nodePresent(t, r, path)
  nodePresent(t, r, path.slice(0, 1))
  nodePresent(t, r, path.slice(0, 2))
})

test('insert() - directory', t => {
  const r = t.context.reg
  const path = ['folder', 'inner']
  r.insert(path, true)
  t.truthy(r.find(path)?.isDir)
})

test('insert() - existing', t => {
  const r = t.context.reg
  const path = ['test.txt']
  r.insert(path)
  t.notThrows(() => {
    r.insert(path)
  })
})

// Remove() tests
test('remove() - nested file', t => {
  const r = t.context.reg
  const path = ['folder', 'inner', 'test.txt']
  r.insert(path)
  nodePresent(t, r, path)

  // Remove most nested text element but not folder
  r.remove(path)
  nodeNotPresent(t, r, path)
  nodePresent(t, r, path.slice(0, 1))
  nodePresent(t, r, path.slice(0, 2))
})

test('remove() - cannot remove file with isDir flag', t => {
  const r = t.context.reg
  const path = ['test.txt']
  r.insert(path)
  nodePresent(t, r, path)
  r.remove(path, true)
  nodePresent(t, r, path)
})

test('remove() - folder without isDir flag', t => {
  const r = t.context.reg
  const path = ['test']
  r.insert(path, true)
  nodePresent(t, r, path)
  r.remove(path, false)
  nodePresent(t, r, path)
})

test('remove() - folder', t => {
  const r = t.context.reg
  const path = ['test']
  r.insert(path, true)
  nodePresent(t, r, path)
  r.remove(path, true)
  nodeNotPresent(t, r, path)
})

test('remove() - folder removes all children', t => {
  const r = t.context.reg
  complexTree(r)
  r.remove(['a'], true)
  nodeNotPresent(t, r, ['a', 'b', 'c.txt'])
  nodeNotPresent(t, r, ['a', 'b', 'd.txt'])
  nodeNotPresent(t, r, ['a', 'b', 'e', 'f.txt'])
  nodeNotPresent(t, r, ['a', 'g.txt'])
  nodePresent(t, r, ['h.txt'])
})

test('remove() - nonexistent file', t => {
  const r = t.context.reg
  const path = ['test']
  t.notThrows(() => {
    r.remove(path, true)
  })
  t.notThrows(() => {
    r.remove(path)
  })
})

// Size() tests
test('size() - empty', t => {
  const r = t.context.reg
  t.is(r.size(), 0)
})

test('size() - single nested', t => {
  const r = t.context.reg
  const path1 = ['folder', 'inner', 'test.txt']
  const path2 = ['folder', 'inner', 'test1.txt']
  r.insert(path1)
  t.is(r.size(), 3)
  r.insert(path2)
  t.is(r.size(), 4)
  r.remove(['folder'], true)
  t.is(r.size(), 0)
})

test('size() - complex', t => {
  const r = t.context.reg
  complexTree(r)
  t.is(r.size(), 8)
})

// GetTree() tests
test('getTree() - empty', t => {
  const r = t.context.reg
  t.deepEqual(r.getTree(), [])
})

test('getTree() - heavily nested', t => {
  const r = t.context.reg
  complexTree(r)
  t.deepEqual(r.getTree().map(node => node.name), [
    'a',
    'b',
    'c.txt',
    'd.txt',
    'e',
    'f.txt',
    'g.txt',
    'h.txt',
  ])
})
