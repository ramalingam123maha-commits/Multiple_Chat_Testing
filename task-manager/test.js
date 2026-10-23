const assert = require('assert'), { server, reset } = require('./server');
server.listen(0, async () => {
  const base = 'http://localhost:' + server.address().port;
  const call = async (m, u, b) => { const r = await fetch(base + u, { method: m, body: b && JSON.stringify(b) }); return [r.status, r.status === 204 ? null : await r.json()]; };
  reset();
  assert.equal((await call('POST', '/api/tasks', {}))[0], 400);
  const [, a] = await call('POST', '/api/tasks', { title: 'A', priority: 'low', deadline: '2020-01-01' });
  const [, b] = await call('POST', '/api/tasks', { title: 'B', priority: 'urgent' });
  const [, list] = await call('GET', '/api/tasks');
  assert.equal(list[0].title, 'B'); assert.equal(list[1].overdue, true);
  await call('POST', `/api/tasks/${a.id}/assign`, { user: 'sam' });
  await call('POST', `/api/tasks/${a.id}/comments`, { user: 'sam', text: 'on it' });
  const [, p] = await call('PATCH', `/api/tasks/${a.id}`, { status: 'done' });
  assert.equal(p.status, 'done'); assert.equal(p.overdue, false); assert.equal(p.comments.length, 1);
  assert.equal((await call('PATCH', `/api/tasks/${a.id}`, { status: 'bad' }))[0], 400);
  console.log('all tests passed'); server.close();
});
