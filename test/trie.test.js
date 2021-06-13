import test from 'ava';
import {TrieNode} from "../domain/trie";

// helpers
const n = (path, folder = false) => new TrieNode(undefined, path, folder)

// getPath() tests
test('root folder path segment', t => {
  t.deepEqual(n('/', true).getPath(), []);
});

test('root file path segment', t => {
  t.deepEqual(n('/test.txt', false).getPath(), []);
});


test('nested folder path segment', t => {
  t.deepEqual(n('/nested/folder/structure/test.txt', false).getPath(), []);
});