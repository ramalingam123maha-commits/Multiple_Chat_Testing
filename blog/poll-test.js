/* ============================================================
   POLL TEST — Verify functionality
   ============================================================ */

const http = require('http');
const WebSocket = require('ws');

const API_URL = 'http://localhost:8080';
const WS_URL = 'ws://localhost:8080';

// Test 1: Create a poll
function testCreatePoll() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/polls',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Poll created:', result.id);
          resolve(result.id);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);

    const pollData = JSON.stringify({
      question: 'What is your favorite programming language?',
      options: ['JavaScript', 'Python', 'Rust', 'Go'],
      userId: 'test_user'
    });

    req.write(pollData);
    req.end();
  });
}

// Test 2: WebSocket voting
function testWebSocketVoting(pollId) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);

    let pollReceived = false;
    let voteReceived = false;

    ws.on('open', () => {
      console.log('✅ WebSocket connected');
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data);

      if (msg.type === 'initial_load') {
        console.log('✅ Received initial polls:', msg.polls.length);
        pollReceived = true;

        // Send a vote
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'vote',
            pollId: msg.polls[0].id,
            optionId: msg.polls[0].options[0].id
          }));
          console.log('✅ Vote sent');
        }, 500);
      }

      if (msg.type === 'vote_cast') {
        console.log('✅ Vote received and processed');
        voteReceived = true;
        console.log('   Updated polls:', msg.polls.length);
        console.log('   Total votes:', msg.polls[0]?.options.reduce((sum, opt) => sum + opt.votes, 0));
        ws.close();
        resolve();
      }
    });

    ws.on('error', reject);
    ws.on('close', () => {
      if (pollReceived && voteReceived) {
        console.log('✅ All tests passed!');
      }
    });

    setTimeout(() => {
      if (!pollReceived) {
        reject(new Error('No initial poll received'));
      }
    }, 3000);
  });
}

// Test 3: Fetch polls
function testFetchPolls() {
  return new Promise((resolve, reject) => {
    http.get(`${API_URL}/api/polls`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const polls = JSON.parse(data);
          console.log('✅ Fetched polls:', polls.length);
          if (polls.length > 0) {
            console.log('   First poll:', polls[0].question);
            console.log('   Total votes:', polls[0].totalVotes);
          }
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Run all tests
(async () => {
  try {
    console.log('\n📊 Running Poll Creator Tests...\n');

    console.log('Test 1: Create Poll');
    const pollId = await testCreatePoll();

    console.log('\nTest 2: WebSocket Voting');
    await testWebSocketVoting(pollId);

    console.log('\nTest 3: Fetch Polls');
    await testFetchPolls();

    console.log('\n✅ All tests completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
})();
