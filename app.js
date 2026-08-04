const difficultySettings = {
    easy: {
        label: 'Easy',
        operations: ['+', '-'],
        range: [1, 20]
    },
    medium: {
        label: 'Medium',
        operations: ['+', '-', '×'],
        range: [2, 12]
    },
    hard: {
        label: 'Hard',
        operations: ['+', '-', '×', '÷'],
        range: [3, 25]
    }
};

const state = {
    difficulty: 'easy',
    totalQuestions: 10,
    timeLimit: 15,
    currentQuestionIndex: 0,
    score: 0,
    currentQuestion: null,
    questionActive: false,
    timerId: null,
    timeRemaining: 15,
    wrongAnswers: [],
    progressHistory: JSON.parse(localStorage.getItem('mathPracticeProgress') || '[]')
};

const difficultyGrid = document.getElementById('difficultyGrid');
const difficultyButtons = Array.from(document.querySelectorAll('.difficulty-btn'));
const questionCountSelect = document.getElementById('questionCount');
const timeLimitSelect = document.getElementById('timeLimit');
const difficultyLabel = document.getElementById('difficultyLabel');
const scoreValue = document.getElementById('scoreValue');
const questionProgress = document.getElementById('questionProgress');
const timerValue = document.getElementById('timerValue');
const timerBar = document.getElementById('timerBar');
const questionText = document.getElementById('questionText');
const questionHint = document.getElementById('questionHint');
const questionCard = document.getElementById('questionCard');
const answerForm = document.getElementById('answerForm');
const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const feedbackMessage = document.getElementById('feedbackMessage');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const reviewList = document.getElementById('reviewList');
const reviewCount = document.getElementById('reviewCount');
const progressChart = document.getElementById('progressChart');
const chartSummary = document.getElementById('chartSummary');
const bestScore = document.getElementById('bestScore');
const roundsPlayed = document.getElementById('roundsPlayed');

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createQuestion() {
    const settings = difficultySettings[state.difficulty];
    const operation = settings.operations[randomInt(0, settings.operations.length - 1)];
    let left;
    let right;
    let prompt;
    let answer;

    if (operation === '÷') {
        right = randomInt(2, 12);
        answer = randomInt(settings.range[0], settings.range[1]);
        left = right * answer;
        prompt = `${left} ÷ ${right}`;
    } else if (operation === '×') {
        left = randomInt(settings.range[0], settings.range[1]);
        right = randomInt(settings.range[0], settings.range[1]);
        answer = left * right;
        prompt = `${left} × ${right}`;
    } else if (operation === '-') {
        left = randomInt(settings.range[0], settings.range[1]);
        right = randomInt(settings.range[0], settings.range[1]);
        if (state.difficulty === 'easy' && right > left) {
            [left, right] = [right, left];
        }
        answer = left - right;
        prompt = `${left} − ${right}`;
    } else {
        left = randomInt(settings.range[0], settings.range[1]);
        right = randomInt(settings.range[0], settings.range[1]);
        answer = left + right;
        prompt = `${left} + ${right}`;
    }

    return { prompt, answer };
}

function setFeedback(message, tone = '') {
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message';
    if (tone) {
        feedbackMessage.classList.add(tone);
    }
}

function updateDashboard() {
    difficultyLabel.textContent = difficultySettings[state.difficulty].label;
    scoreValue.textContent = state.score;
    questionProgress.textContent = `${Math.min(state.currentQuestionIndex, state.totalQuestions)} / ${state.totalQuestions}`;
    timerValue.textContent = `${state.timeRemaining}s`;
    const timerPercent = (state.timeRemaining / state.timeLimit) * 100;
    timerBar.style.width = `${Math.max(timerPercent, 0)}%`;
    timerBar.style.background = timerPercent <= 35
        ? 'linear-gradient(90deg, #f97316, #dc2626)'
        : 'linear-gradient(90deg, #16a34a, #f97316)';
    bestScore.textContent = state.progressHistory.reduce((max, item) => Math.max(max, item.score), 0);
    roundsPlayed.textContent = state.progressHistory.length;
}

function renderReviewList() {
    reviewCount.textContent = `${state.wrongAnswers.length} item${state.wrongAnswers.length === 1 ? '' : 's'}`;

    if (state.wrongAnswers.length === 0) {
        reviewList.className = 'review-list empty-state';
        reviewList.textContent = 'Mistakes from the current round will appear here for review.';
        return;
    }

    reviewList.className = 'review-list';
    reviewList.innerHTML = state.wrongAnswers.map(item => `
        <article class="review-item">
            <strong>${item.prompt}</strong>
            <p>Your answer: ${item.userAnswer}</p>
            <p>Correct answer: ${item.correctAnswer}</p>
        </article>
    `).join('');
}

function renderChart() {
    const ctx = progressChart.getContext('2d');
    const width = progressChart.width;
    const height = progressChart.height;
    ctx.clearRect(0, 0, width, height);

    const history = state.progressHistory.slice(-8);
    ctx.fillStyle = '#f8fbff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i += 1) {
        const y = 30 + ((height - 60) / 4) * i;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();
    }

    ctx.fillStyle = '#475569';
    ctx.font = '12px Segoe UI';
    const maxScore = Math.max(...history.map(item => item.score), state.totalQuestions, 5);

    for (let i = 0; i < 5; i += 1) {
        const value = Math.round(maxScore - (maxScore / 4) * i);
        const y = 34 + ((height - 60) / 4) * i;
        ctx.fillText(String(value), 10, y);
    }

    if (history.length === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px Segoe UI';
        ctx.fillText('No rounds completed yet.', width / 2 - 84, height / 2);
        chartSummary.textContent = 'Play a round to generate your first progress point.';
        return;
    }

    const pointGap = history.length === 1 ? 0 : (width - 90) / (history.length - 1);
    const points = history.map((item, index) => {
        const x = 50 + pointGap * index;
        const y = height - 30 - (item.score / maxScore) * (height - 70);
        return { x, y, ...item };
    });

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    ctx.stroke();

    points.forEach((point, index) => {
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#475569';
        ctx.fillText(`R${state.progressHistory.length - history.length + index + 1}`, point.x - 10, height - 10);
    });

    const latest = history[history.length - 1];
    chartSummary.textContent = `Latest round: ${latest.score}/${latest.total} correct on ${latest.difficulty}. Average score: ${Math.round(history.reduce((sum, item) => sum + item.score, 0) / history.length)}.`;
}

function stopTimer() {
    window.clearInterval(state.timerId);
    state.timerId = null;
}

function lockQuestion() {
    state.questionActive = false;
    answerInput.disabled = true;
    submitBtn.disabled = true;
}

function startTimer() {
    stopTimer();
    state.timeRemaining = state.timeLimit;
    updateDashboard();

    state.timerId = window.setInterval(() => {
        state.timeRemaining -= 1;
        updateDashboard();

        if (state.timeRemaining <= 0) {
            stopTimer();
            handleAnswer(null, true);
        }
    }, 1000);
}

function showQuestion() {
    state.currentQuestion = createQuestion();
    state.currentQuestionIndex += 1;
    state.questionActive = true;
    questionCard.classList.remove('waiting');
    questionText.textContent = state.currentQuestion.prompt;
    questionHint.textContent = 'Solve the problem before time runs out.';
    answerInput.value = '';
    answerInput.disabled = false;
    submitBtn.disabled = false;
    answerInput.focus();
    nextBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
    setFeedback('Think carefully and submit your answer.');
    updateDashboard();
    startTimer();
}

function beginRound() {
    stopTimer();
    state.totalQuestions = Number(questionCountSelect.value);
    state.timeLimit = Number(timeLimitSelect.value);
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.wrongAnswers = [];
    renderReviewList();
    startBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
    showQuestion();
}

function finishRound() {
    lockQuestion();
    stopTimer();
    questionText.textContent = 'Round complete!';
    questionHint.textContent = `Final score: ${state.score} out of ${state.totalQuestions}. Review any mistakes below.`;
    setFeedback(state.score === state.totalQuestions ? 'Perfect round. Outstanding work!' : 'Round finished. Review missed questions and try again.', state.score === state.totalQuestions ? 'correct' : '');
    restartBtn.classList.remove('hidden');
    nextBtn.classList.add('hidden');

    state.progressHistory.push({
        score: state.score,
        total: state.totalQuestions,
        difficulty: difficultySettings[state.difficulty].label
    });
    state.progressHistory = state.progressHistory.slice(-20);
    localStorage.setItem('mathPracticeProgress', JSON.stringify(state.progressHistory));
    updateDashboard();
    renderChart();
}

function handleAnswer(value, timedOut = false) {
    if (!state.questionActive) {
        return;
    }

    lockQuestion();
    stopTimer();

    const userAnswer = timedOut ? 'No answer' : Number(value);
    const isCorrect = !timedOut && userAnswer === state.currentQuestion.answer;

    if (isCorrect) {
        state.score += 1;
        setFeedback('Correct! Great job.', 'correct');
        questionHint.textContent = 'Nice work — keep the streak going.';
    } else {
        state.wrongAnswers.push({
            prompt: state.currentQuestion.prompt,
            userAnswer,
            correctAnswer: state.currentQuestion.answer
        });
        renderReviewList();
        setFeedback(timedOut ? `Time is up. The correct answer was ${state.currentQuestion.answer}.` : `Not quite. The correct answer was ${state.currentQuestion.answer}.`, 'incorrect');
        questionHint.textContent = timedOut ? 'Try solving the next one a bit faster.' : 'Review the correct answer and keep practicing.';
    }

    updateDashboard();

    if (state.currentQuestionIndex >= state.totalQuestions) {
        finishRound();
    } else {
        nextBtn.classList.remove('hidden');
    }
}

difficultyGrid.addEventListener('click', event => {
    const button = event.target.closest('.difficulty-btn');
    if (!button) {
        return;
    }

    state.difficulty = button.dataset.difficulty;
    difficultyButtons.forEach(item => item.classList.toggle('active', item === button));
    updateDashboard();
});

answerForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!state.questionActive || answerInput.value === '') {
        return;
    }
    handleAnswer(answerInput.value);
});

startBtn.addEventListener('click', beginRound);
nextBtn.addEventListener('click', showQuestion);
restartBtn.addEventListener('click', beginRound);
questionCountSelect.addEventListener('change', () => {
    state.totalQuestions = Number(questionCountSelect.value);
    updateDashboard();
    renderChart();
});
timeLimitSelect.addEventListener('change', () => {
    state.timeLimit = Number(timeLimitSelect.value);
    state.timeRemaining = state.timeLimit;
    updateDashboard();
});

updateDashboard();
renderReviewList();
renderChart();
setFeedback('Your feedback will appear here.');
