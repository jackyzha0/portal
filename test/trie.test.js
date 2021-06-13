import test from 'ava';
import {TrieNode} from "../domain/trie";

test('test 1', t => {
  const n = new TrieNode(undefined, '/', true)
  t.deepEqual([1, 2], [1, 2]);
});