// Character sets used to build passwords
const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// DOM Elements
const passwordOutput = document.getElementById('passwordOutput');
const copyBtn = document.getElementById('copyBtn');
const generateBtn = document.getElementById('generateBtn');
const generateMainBtn = document.getElementById('generateMainBtn');
const copyFeedback = document.getElementById('copyFeedback');
const strengthBar = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');
const uppercaseOption = document.getElementById('uppercaseOption');
const lowercaseOption = document.getElementById('lowercaseOption');
const numbersOption = document.getElementById('numbersOption');
const symbolsOption = document.getElementById('symbolsOption');
const optionsError = document.getElementById('optionsError');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

const MAX_HISTORY = 15;
const history = [];

// Cryptographically secure random integer in [0, max), unbiased via rejection sampling
function secureRandomInt(max) {
    if (max <= 0 || max > 256) {
        throw new RangeError('secureRandomInt supports max in the range (0, 256]');
    }
    const range = 256 - (256 % max);
    let byte;
    do {
        byte = crypto.getRandomValues(new Uint8Array(1))[0];
    } while (byte >= range);
    return byte % max;
}

function getSelectedOptions() {
    return {
        uppercase: uppercaseOption.checked,
        lowercase: lowercaseOption.checked,
        numbers: numbersOption.checked,
        symbols: symbolsOption.checked
    };
}

function getActivePools(options) {
    return Object.keys(options)
        .filter(key => options[key])
        .map(key => CHAR_SETS[key]);
}

function generatePassword(length, options) {
    const pools = getActivePools(options);
    if (pools.length === 0) return null;

    const allChars = pools.join('');
    const passwordChars = [];

    // Guarantee at least one character from each selected set (when length allows)
    pools.forEach(pool => {
        if (passwordChars.length < length) {
            passwordChars.push(pool[secureRandomInt(pool.length)]);
        }
    });

    while (passwordChars.length < length) {
        passwordChars.push(allChars[secureRandomInt(allChars.length)]);
    }

    // Fisher-Yates shuffle using a secure RNG so the guaranteed characters
    // aren't always in the same leading positions
    for (let i = passwordChars.length - 1; i > 0; i--) {
        const j = secureRandomInt(i + 1);
        [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    return passwordChars.join('');
}

function calculateStrength(passwordLength, options) {
    let poolSize = 0;
    if (options.uppercase) poolSize += CHAR_SETS.uppercase.length;
    if (options.lowercase) poolSize += CHAR_SETS.lowercase.length;
    if (options.numbers) poolSize += CHAR_SETS.numbers.length;
    if (options.symbols) poolSize += CHAR_SETS.symbols.length;

    if (poolSize === 0) return { entropy: 0, label: 'Strength', percent: 0, color: '#e0e0e0' };

    const entropy = passwordLength * Math.log2(poolSize);

    let label, color;
    if (entropy < 40) {
        label = 'Weak';
        color = '#e74c3c';
    } else if (entropy < 60) {
        label = 'Fair';
        color = '#f39c12';
    } else if (entropy < 80) {
        label = 'Good';
        color = '#f1c40f';
    } else {
        label = 'Strong';
        color = '#2ecc71';
    }

    const percent = Math.min(100, Math.round((entropy / 128) * 100));
    return { entropy, label, percent, color };
}

function renderStrength(passwordLength, options) {
    const { label, percent, color } = calculateStrength(passwordLength, options);
    strengthBar.style.width = `${percent}%`;
    strengthBar.style.background = color;
    strengthLabel.textContent = `Strength: ${label}`;
}

function showOptionsError(message) {
    optionsError.textContent = message;
}

async function copyToClipboard(text) {
    if (!text) return false;
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for browsers without Clipboard API access
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        let succeeded = false;
        try {
            succeeded = document.execCommand('copy');
        } catch (e) {
            succeeded = false;
        }
        document.body.removeChild(textarea);
        return succeeded;
    }
}

function flashCopyFeedback() {
    copyFeedback.classList.add('visible');
    clearTimeout(flashCopyFeedback._timer);
    flashCopyFeedback._timer = setTimeout(() => {
        copyFeedback.classList.remove('visible');
    }, 1500);
}

function addToHistory(password) {
    history.unshift({ password, time: new Date() });
    if (history.length > MAX_HISTORY) history.pop();
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<li class="history-empty">No passwords generated yet.</li>';
        return;
    }

    historyList.innerHTML = history
        .map((entry, index) => `
            <li class="history-item">
                <span class="history-password">${escapeHtml(entry.password)}</span>
                <span class="history-time">${entry.time.toLocaleTimeString()}</span>
                <button class="history-copy-btn" data-index="${index}" title="Copy password" aria-label="Copy password">📋</button>
            </li>
        `)
        .join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function handleGenerate() {
    const options = getSelectedOptions();
    const length = parseInt(lengthSlider.value, 10);

    if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
        showOptionsError('Select at least one character type.');
        return;
    }
    showOptionsError('');

    const password = generatePassword(length, options);
    passwordOutput.value = password;
    renderStrength(length, options);
    addToHistory(password);
}

// Event listeners
lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
});

generateBtn.addEventListener('click', handleGenerate);
generateMainBtn.addEventListener('click', handleGenerate);

copyBtn.addEventListener('click', async () => {
    const copied = await copyToClipboard(passwordOutput.value);
    if (copied) flashCopyFeedback();
});

historyList.addEventListener('click', async (event) => {
    const btn = event.target.closest('.history-copy-btn');
    if (!btn) return;
    const index = parseInt(btn.dataset.index, 10);
    const entry = history[index];
    if (!entry) return;
    const copied = await copyToClipboard(entry.password);
    if (copied) flashCopyFeedback();
});

clearHistoryBtn.addEventListener('click', () => {
    history.length = 0;
    renderHistory();
});

// Generate an initial password on load
document.addEventListener('DOMContentLoaded', handleGenerate);
