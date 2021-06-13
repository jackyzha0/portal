import test from 'ava';
import {Registry} from "../domain/registry";

// helpers
test.beforeEach(t => {
  t.context.reg = new Registry();
});


function nodeNotPresent(t, r, pathSegments) {
  t.falsy(r.find(pathSegments));
}

function nodePresent(t, r, pathSegments) {
  t.truthy(r.find(pathSegments));
}

// getPath() tests
test('root folder path segment', t => {
  const r = t.context.reg
  const path = ['folder', 'inner', 'test.txt']
  nodeNotPresent(t, r, path)
  r.insert(path)
  nodePresent(t, r, path)
});
