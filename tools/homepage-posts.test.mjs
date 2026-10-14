import assert from 'node:assert/strict';
import test from 'node:test';
import { orderHomepagePosts } from '../src/lib/homepage-posts.ts';

const expense = [
  'verified-not-trusted-expense-analysis-part-one',
  'verified-not-trusted-expense-analysis-part-two',
  'verified-not-trusted-expense-analysis-part-three',
  'verified-not-trusted-expense-analysis-part-four',
];
const exceptions = [
  'programming-to-exceptions-method-contracts',
  'programming-to-exceptions-diagnostics-and-boundaries',
  'programming-to-exceptions-logging-and-progress',
];
const article = (id, datePublished, dateModified) => ({
  id,
  data: { title: id, datePublished: new Date(datePublished), ...(dateModified ? { dateModified: new Date(dateModified) } : {}) },
});
const ids = (posts) => orderHomepagePosts(posts).map((post) => post.id);

test('expense parts remain uninterrupted despite intervening publications', () => {
  const posts = [
    article(expense[0], '2026-09-30'),
    article('pipeline-breadcrumbs', '2026-10-05'),
    article(expense[1], '2026-10-06'),
    article('skills-versus-controlled-workflows', '2026-06-19', '2026-10-09'),
    article(expense[2], '2026-10-11'),
    article(expense[3], '2026-10-12'),
    article('newer-post', '2026-10-13'),
  ];
  assert.deepEqual(ids(posts), ['newer-post', ...expense.toReversed(), 'skills-versus-controlled-workflows', 'pipeline-breadcrumbs']);
});

test('equal-dated exception parts use descending part order', () => {
  const posts = exceptions.map((id) => article(id, '2019-10-28', '2026-10-02'));
  assert.deepEqual(ids(posts), exceptions.toReversed());
});

test('a revision moves the whole series while preserving its part order', () => {
  const posts = [
    article(expense[0], '2026-09-30', '2026-10-20'),
    article('other-post', '2026-10-15'),
    article(expense[3], '2026-10-12'),
  ];
  assert.deepEqual(ids(posts), [expense[3], expense[0], 'other-post']);
});

test('unpublished parts are not invented and inputs remain unchanged', () => {
  const posts = [article(expense[1], '2026-10-06'), article('older-post', '2026-09-01')];
  const before = structuredClone(posts);
  const ordered = orderHomepagePosts(posts);
  assert.deepEqual(posts, before);
  assert.deepEqual(ordered, posts);
  assert.equal(ordered[0], posts[0]);
  assert.equal(ordered.length, posts.length);
});

test('standalone posts retain publication/update sorting and deterministic ties', () => {
  const posts = [
    article('z-title', '2026-09-02'),
    article('a-title', '2026-09-02'),
    article('updated', '2026-08-01', '2026-09-03'),
    article('newer-publication', '2026-09-03'),
  ];
  assert.deepEqual(ids(posts), ['newer-publication', 'updated', 'a-title', 'z-title']);
});
