import test from 'ava';
import {Registry} from "../domain/registry";

// helpers
test.beforeEach(t => {
  t.context.reg = new Registry();
});

const nodeNotPresent = (t, r, pathSegments) => t.falsy(r.find(pathSegments))
const nodePresent = (t, r, pathSegments) => t.truthy(r.find(pathSegments))

// find() tests
test('find() - empty root', t => {
  const r = t.context.reg
  nodeNotPresent(t, r, ['test'])
  nodePresent(t, r, [])
});

test('find() - file at root', t => {
  const r = t.context.reg
  const path = ['test']
  nodeNotPresent(t, r, path)
  r.insert(path)
  nodePresent(t, r, path)
});

test('find() - file not present', t => {
  const r = t.context.reg
  r.insert(['test'])
  nodeNotPresent(t, r, ['test', 'notPresent'])
  nodeNotPresent(t, r, ['alsoNotPresent'])
});

// insert() tests
test('insert() - nested file', t => {
  const r = t.context.reg
  const path = ['folder', 'inner', 'test.txt']
  r.insert(path)
  nodePresent(t, r, path)
  nodePresent(t, r, path.slice(0, 1))
  nodePresent(t, r, path.slice(0, 2))
});

test('insert() - directory', t => {
  const r = t.context.reg
  const path = ['folder', 'inner']
  r.insert(path, true)
  t.truthy(r.find(path).isDir)
})

test('insert() - existing', t => {
  const r = t.context.reg
  const path = ['test.txt']
  r.insert(path)
  t.notThrows(() => r.insert(path))
})

// remove() tests
test.todo('remove() - nested file')
test.todo('remove() - folder')
test.todo('remove() - nonexistent file')

// size() tests
test.todo('size() - empty')
test.todo('size() - single nested')
test.todo('size() - complex')

// getTree() tests
test.todo('getTree() - empty')
test.todo('getTree() - heavily nested')

// diff() tests
test.todo('diff() - two empty trees')
test.todo('diff() - empty to full tree')
test.todo('diff() - full tree to empty tree')
test.todo('diff() - off-by-one add tree')
test.todo('diff() - off-by-one delete tree')
test.todo('diff() - off-by-many tree')