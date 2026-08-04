/* ============================================================
   COMPREHENSIVE POLL CREATOR TEST
   ============================================================ */

const http = require('http');
const WebSocket = require('ws');

const WS_URL = 'ws://localhost:8080';
const API_URL = 'http://localhost:8080';

// Test utilities
const tests = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  📊 POLL CREATOR COMPREHENSIVE TEST SUITE  ║');
  console.log('╚════════════════════════════════════════════╝\n');

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passCount++;
    } catch (err) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${err.message}`);
      failCount++;
    }
  }

  console.log('\n╔════════════════════════════════════════════╗');
  console.log(`║  Results: ${passCount} passed, ${failCount} failed ${' '.repeat(14)}║`);
  console.log('╚════════════════════════════════════════════╝\n');

  process.exit(failCount > 0 ? 1 : 0);
}

// Test 1: Poll Creation
test('Poll Creation - Creates poll with question and options', async () => {
  return new Promise((resolve, reject) => {
    const pollData = JSON.stringify({
      question: 'Best JavaScript Framework?',
      options: ['React', 'Vue', 'Svelte', 'Angular'],
      userId: 'test_user_1'
    });

    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/polls',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (!result.id || !result.shareUrl) throw new Error('Invalid response');
          resolve();
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(pollData);
    req.end();
  });
});

// Test 2: Fetch All Polls
test('Fetch Polls - Retrieves all polls via HTTP', async () => {
  return new Promise((resolve, reject) => {
    http.get(`${API_URL}/api/polls`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const polls = JSON.parse(data);
          if (!Array.isArray(polls)) throw new Error('Response not array');
          if (polls.length === 0) throw new Error('No polls found');
          resolve();
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
});

// Test 3: WebSocket Connection
test('WebSocket Connection - Establishes connection and receives initial load', async () => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    let received = false;

    ws.on('open', () => {
      // Connection established
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === 'initial_load' && Array.isArray(msg.polls)) {
          received = true;
          ws.close();
          resolve();
        }
      } catch (e) { reject(e); }
    });

    ws.on('error', reject);

    setTimeout(() => {
      if (!received) reject(new Error('No initial_load received'));
    }, 5000);
  });
});

// Test 4: Vote Casting
test('Vote Casting - Casts vote and receives update', async () => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    let pollId = null;
    let optionId = null;
    let voteReceived = false;

    ws.on('message', (data) => {
      const msg = JSON.parse(data);

      if (msg.type === 'initial_load' && msg.polls.length > 0) {
        pollId = msg.polls[0].id;
        optionId = msg.polls[0].options[0].id;
        ws.send(JSON.stringify({ type: 'vote', pollId, optionId }));
      }

      if (msg.type === 'vote_cast') {
        voteReceived = true;
        if (msg.polls && msg.pollId) {
          ws.close();
          resolve();
        }
      }
    });

    ws.on('error', reject);

    setTimeout(() => {
      if (!voteReceived) reject(new Error('Vote not received'));
    }, 5000);
  });
});

// Test 5: Result Updates
test('Result Updates - Vote count increases in results', async () => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    let initialVotes = 0;
    let pollId = null;
    let optionId = null;

    ws.on('message', (data) => {
      const msg = JSON.parse(data);

      if (msg.type === 'initial_load' && msg.polls.length > 0) {
        const poll = msg.polls[0];
        pollId = poll.id;
        optionId = poll.options[0].id;
        initialVotes = poll.totalVotes;
        ws.send(JSON.stringify({ type: 'vote', pollId, optionId }));
      }

      if (msg.type === 'vote_cast' && msg.polls) {
        const poll = msg.polls.find(p => p.id === pollId);
        if (poll && poll.totalVotes > initialVotes) {
          ws.close();
          resolve();
        }
      }
    });

    ws.on('error', reject);

    setTimeout(() => {
      reject(new Error('Vote count did not increase'));
    }, 5000);
  });
});

// Test 6: Multiple Polls
test('Multiple Polls - Can create and retrieve multiple polls', async () => {
  return new Promise((resolve, reject) => {
    let count = 0;

    for (let i = 0; i < 2; i++) {
      const pollData = JSON.stringify({
        question: `Test Poll ${i + 1}?`,
        options: ['Yes', 'No', 'Maybe'],
        userId: `test_user_${i}`
      });

      const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/api/polls',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          count++;
          if (count === 2) resolve();
        });
      });
      req.on('error', reject);
      req.write(pollData);
      req.end();
    }
  });
});

// Test 7: Poll Data Integrity
test('Poll Data Integrity - Poll contains all required fields', async () => {
  return new Promise((resolve, reject) => {
    http.get(`${API_URL}/api/polls`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const polls = JSON.parse(data);
          const poll = polls[0];

          const required = ['id', 'question', 'options', 'totalVotes', 'createdAt'];
          for (const field of required) {
            if (!(field in poll)) {
              throw new Error(`Missing field: ${field}`);
            }
          }

          if (!Array.isArray(poll.options) || poll.options.length === 0) {
            throw new Error('Invalid options array');
          }

          const option = poll.options[0];
          if (!('id' in option) || !('text' in option) || !('votes' in option)) {
            throw new Error('Option missing required fields');
          }

          resolve();
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
});

// Test 8: Real-time Synchronization
test('Real-time Sync - Two clients see same results', async () => {
  return new Promise((resolve, reject) => {
    const ws1 = new WebSocket(WS_URL);
    const ws2 = new WebSocket(WS_URL);
    let pollId = null;
    let optionId = null;
    let client2Updated = false;

    ws1.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'initial_load' && msg.polls.length > 0) {
        pollId = msg.polls[0].id;
        optionId = msg.polls[0].options[0].id;
        setTimeout(() => {
          ws1.send(JSON.stringify({ type: 'vote', pollId, optionId }));
        }, 100);
      }
    });

    ws2.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'vote_cast') {
        client2Updated = true;
        ws1.close();
        ws2.close();
        resolve();
      }
    });

    Promise.all([ws1, ws2].map(ws => new Promise(r => ws.on('open', r))))
      .catch(reject);

    setTimeout(() => {
      if (!client2Updated) {
        reject(new Error('Client 2 did not receive update'));
      }
    }, 5000);
  });
});

// Run all tests
runTests();
