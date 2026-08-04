const http = require('http');
const WebSocket = require('ws');

async function demo() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  🎯 POLL CREATOR — LIVE DEMO              ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Demo 1: Create a poll
  console.log('📝 DEMO 1: Creating a poll...');
  const createRes = await fetch('http://localhost:8080/api/polls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: '🎮 What is your favorite game?',
      options: ['Minecraft', 'Elden Ring', 'Baldur\'s Gate 3', 'Stardew Valley'],
      userId: 'demo_user'
    })
  });
  const pollData = await createRes.json();
  console.log(`✅ Poll created with ID: ${pollData.id}`);
  console.log(`   Share URL: ${pollData.shareUrl}\n`);

  // Demo 2: Get all polls
  console.log('📊 DEMO 2: Fetching all polls...');
  const allRes = await fetch('http://localhost:8080/api/polls');
  const allPolls = await allRes.json();
  console.log(`✅ Fetched ${allPolls.length} poll(s)`);
  console.log(`   Latest poll: "${allPolls[allPolls.length - 1].question}"\n`);

  // Demo 3: WebSocket voting
  console.log('🗳️  DEMO 3: WebSocket voting...');
  const ws = new WebSocket('ws://localhost:8080');
  
  return new Promise((resolve) => {
    ws.onopen = () => {
      console.log('✅ Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'initial_load') {
        console.log(`✅ Received ${data.polls.length} poll(s) from server`);
        
        // Cast a vote
        console.log('\n🗳️  Casting vote...');
        const latestPoll = data.polls[data.polls.length - 1];
        ws.send(JSON.stringify({
          type: 'vote',
          pollId: latestPoll.id,
          optionId: latestPoll.options[0].id
        }));
      } else if (data.type === 'vote_cast') {
        const votedPoll = data.polls[data.polls.length - 1];
        console.log(`✅ Vote recorded!`);
        console.log(`   Poll: "${votedPoll.question}"`);
        console.log(`   Results:`);
        votedPoll.options.forEach((opt, i) => {
          const pct = votedPoll.totalVotes > 0 ? Math.round((opt.votes / votedPoll.totalVotes) * 100) : 0;
          const bar = '█'.repeat(Math.round(pct / 5)).padEnd(20, '░');
          console.log(`     ${i + 1}. ${opt.text.padEnd(16)} ${bar} ${opt.votes} votes (${pct}%)`);
        });
        console.log(`\n📈 Total votes: ${votedPoll.totalVotes}`);
        ws.close();
        resolve();
      }
    };
  });
}

demo().then(() => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  ✅ Demo completed successfully!           ║');
  console.log('╚════════════════════════════════════════════╝');
  process.exit(0);
});
