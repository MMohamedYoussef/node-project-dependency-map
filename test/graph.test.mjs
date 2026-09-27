import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, toMermaid } from '../src/graph.mjs';

test('orders dependencies before dependents and detects missing names', () => {
  const result = analyze({ app: ['lib'], lib: [], docs: ['missing'] });
  assert.deepEqual(result.install_order, ['lib', 'app', 'docs']);
  assert.deepEqual(result.missing, ['missing']);
  assert.deepEqual(result.cycles, []);
});

test('reports dependency cycles and rejects unsafe Mermaid names', () => {
  assert.deepEqual(analyze({ a: ['b'], b: ['a'] }).cycles, [['a', 'b', 'a']]);
  assert.throws(() => analyze({ 'a[bad]': [] }), /package name/i);
  const diagram = toMermaid(analyze({ app: ['lib'], lib: [] }));
  assert.match(diagram, /p0\["app"\]/);
  assert.match(diagram, /p1\["lib"\]/);
  assert.match(diagram, /p0 --> p1/);
});

test('escapes Mermaid reserved words in package names', () => {
  const diagram = toMermaid(analyze({ app: ['end'], end: [] }));
  assert.match(diagram, /p1\["end"\]/);
  assert.match(diagram, /p0 --> p1/);
  assert.ok(!diagram.includes('end[end]'));
});

test('handles a long valid dependency chain without recursion overflow', () => {
  const graph = Object.fromEntries(Array.from({ length: 15_000 }, (_, index) => [
    `p${index}`, index === 14_999 ? [] : [`p${index + 1}`],
  ]));
  const result = analyze(graph);
  assert.equal(result.install_order.length, 15_000);
  assert.equal(result.install_order[0], 'p14999');
  assert.equal(result.install_order.at(-1), 'p0');
});
