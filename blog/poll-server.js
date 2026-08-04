/* ============================================================
   POLL CREATOR — WebSocket Server
   ============================================================ */

const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const fs = require('fs');
const path = require('path');

// ── In-memory store ──
const polls = new Map();
const votes = new Map(); // userId -> Set of pollIds they've voted on

// Generate unique IDs
function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

// Initialize server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // ── GET /api/polls ──
  if (pathname === '/api/polls' && req.method === 'GET') {
    const allPolls = Array.from(polls.values()).map(poll => ({
      ...poll,
      options: poll.options.map(opt => ({
        text: opt.text,
        votes: opt.voteCount
      })),
      totalVotes: poll.options.reduce((sum, opt) => sum + opt.voteCount, 0)
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(allPolls));
    return;
  }

  // ── GET /api/polls/:id ──
  if (pathname.startsWith('/api/polls/') && req.method === 'GET') {
    const pollId = pathname.split('/')[3];
    const poll = polls.get(pollId);
    if (!poll) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Poll not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: poll.id,
      question: poll.question,
      options: poll.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        votes: opt.voteCount
      })),
      totalVotes: poll.options.reduce((sum, opt) => sum + opt.voteCount, 0),
      createdAt: poll.createdAt
    }));
    return;
  }

  // ── POST /api/polls ──
  if (pathname === '/api/polls' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const pollId = generateId();
        const poll = {
          id: pollId,
          question: data.question,
          options: data.options.map(opt => ({
            id: generateId(),
            text: opt,
            voteCount: 0
          })),
          createdAt: new Date().toISOString(),
          createdBy: data.userId || 'anonymous'
        };
        polls.set(pollId, poll);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: pollId, shareUrl: `${req.headers.host}/polls/${pollId}` }));
        broadcastPollUpdate('new_poll', poll);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // Default response
  res.writeHead(404);
  res.end();
});

// ── WebSocket Setup ──
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws, req) => {
  const clientId = generateId();
  clients.add({ ws, clientId });
  console.log(`[WS] Client ${clientId} connected. Total: ${clients.size}`);

  // Send all current polls to new client
  const allPolls = Array.from(polls.values()).map(poll => ({
    id: poll.id,
    question: poll.question,
    options: poll.options.map(opt => ({
      id: opt.id,
      text: opt.text,
      votes: opt.voteCount
    })),
    totalVotes: poll.options.reduce((sum, opt) => sum + opt.voteCount, 0),
    createdAt: poll.createdAt
  }));

  ws.send(JSON.stringify({
    type: 'initial_load',
    polls: allPolls
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'vote') {
        const poll = polls.get(data.pollId);
        const option = poll?.options.find(opt => opt.id === data.optionId);

        if (poll && option) {
          // Track vote (simple userId tracking)
          if (!votes.has(clientId)) {
            votes.set(clientId, new Set());
          }
          
          // Check if already voted on this poll
          const userVotes = votes.get(clientId);
          if (!userVotes.has(data.pollId)) {
            option.voteCount += 1;
            userVotes.add(data.pollId);

            // Broadcast update to all clients
            broadcastPollUpdate('vote_cast', {
              pollId: data.pollId,
              optionId: data.optionId,
              totalVotes: poll.options.reduce((sum, opt) => sum + opt.voteCount, 0),
              polls: Array.from(polls.values()).map(p => ({
                id: p.id,
                question: p.question,
                options: p.options.map(opt => ({
                  id: opt.id,
                  text: opt.text,
                  votes: opt.voteCount
                })),
                totalVotes: p.options.reduce((sum, opt) => sum + opt.voteCount, 0),
                createdAt: p.createdAt
              }))
            });
          }
        }
      }
    } catch (e) {
      console.error('[WS] Message error:', e.message);
    }
  });

  ws.on('close', () => {
    clients.delete(Array.from(clients).find(c => c.clientId === clientId));
    console.log(`[WS] Client ${clientId} disconnected. Total: ${clients.size}`);
  });
});

function broadcastPollUpdate(type, data) {
  const message = JSON.stringify({ type, ...data });
  clients.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Poll server running on port ${PORT}`);
});
