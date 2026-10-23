const http = require('http'), fs = require('fs'), path = require('path');
const PRI = ['low', 'medium', 'high', 'urgent'], STAT = ['todo', 'in-progress', 'done'];
let tasks = [], seq = 1;
const clients = new Set();
const push = () => clients.forEach(r => r.write(`data: ${JSON.stringify(tasks)}\n\n`));
const view = t => ({ ...t, overdue: t.status !== 'done' && !!t.deadline && t.deadline < new Date().toISOString().slice(0, 10) });

function route(m, u, b, q) {
  let x;
  if (m === 'GET' && u === '/api/tasks') {
    let l = tasks.map(view);
    if (q.get('status')) l = l.filter(t => t.status === q.get('status'));
    if (q.get('assignee')) l = l.filter(t => t.assignees.includes(q.get('assignee')));
    return [200, l.sort((a, b) => PRI.indexOf(b.priority) - PRI.indexOf(a.priority) || (a.deadline || '9').localeCompare(b.deadline || '9'))];
  }
  if (m === 'POST' && u === '/api/tasks') {
    if (!b.title) return [400, { error: 'title required' }];
    const priority = b.priority || 'medium'; if (!PRI.includes(priority)) return [400, { error: 'invalid priority' }];
    if (b.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(b.deadline)) return [400, { error: 'deadline must be YYYY-MM-DD' }];
    const t = { id: seq++, title: String(b.title), description: String(b.description || ''), priority, deadline: b.deadline || null, status: 'todo', createdBy: String(b.user || 'anonymous'), assignees: [], comments: [] };
    tasks.push(t); push(); return [201, view(t)];
  }
  if ((x = u.match(/^\/api\/tasks\/(\d+)(?:\/(assign|comments))?$/))) {
    const t = tasks.find(t => t.id === +x[1]); if (!t) return [404, { error: 'Not found' }];
    if (!x[2] && m === 'PATCH') {
      if (b.status !== undefined) { if (!STAT.includes(b.status)) return [400, { error: 'invalid status' }]; t.status = b.status; }
      if (b.priority !== undefined) { if (!PRI.includes(b.priority)) return [400, { error: 'invalid priority' }]; t.priority = b.priority; }
      if (b.deadline !== undefined) t.deadline = b.deadline; if (b.title) t.title = String(b.title);
      push(); return [200, view(t)];
    }
    if (!x[2] && m === 'DELETE') { tasks = tasks.filter(k => k !== t); push(); return [204, null]; }
    if (x[2] === 'assign' && m === 'POST') { if (!b.user) return [400, { error: 'user required' }]; if (!t.assignees.includes(b.user)) t.assignees.push(String(b.user)); push(); return [200, view(t)]; }
    if (x[2] === 'comments' && m === 'POST') { if (!b.user || !b.text) return [400, { error: 'user and text required' }]; t.comments.push({ user: String(b.user), text: String(b.text), at: new Date().toISOString() }); push(); return [201, view(t)]; }
  }
  return [404, { error: 'Not found' }];
}
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x'), u = url.pathname;
  if (u === '/api/events') { res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }); res.write(`data: ${JSON.stringify(tasks)}\n\n`); clients.add(res); return req.on('close', () => clients.delete(res)); }
  if (!u.startsWith('/api/')) {
    const pub = path.join(__dirname, 'public'), f = path.join(pub, u === '/' ? 'index.html' : u);
    if (!f.startsWith(pub + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript' }[path.extname(f)] || 'text/plain' }); return fs.createReadStream(f).pipe(res);
  }
  let raw = ''; req.on('data', d => { raw += d; if (raw.length > 1e6) req.destroy(); });
  req.on('end', () => {
    let b = {}; try { if (raw) b = JSON.parse(raw); } catch { res.writeHead(400); return res.end('{"error":"Invalid JSON"}'); }
    const [c, body] = route(req.method, u, b, url.searchParams);
    if (body === null) { res.writeHead(c); return res.end(); }
    res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body));
  });
});
module.exports = { server, reset: () => { tasks = []; seq = 1; } };
if (require.main === module) server.listen(process.env.PORT || 3000, () => console.log('Task manager running'));
