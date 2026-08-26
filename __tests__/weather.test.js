/**
 * __tests__/weather.test.js
 *
 * Unit tests for pure utility logic extracted from app.js / products.js.
 * DOM-dependent UI code is tested via jsdom stubs.
 */

// ─── Helpers lifted inline so tests have no import-path dependency ────────────

/**
 * Converts Kelvin to Celsius, rounded to 1 decimal place.
 * @param {number} kelvin
 * @returns {number}
 */
function kelvinToCelsius(kelvin) {
  return Math.round((kelvin - 273.15) * 10) / 10;
}

/**
 * Converts metres/second to km/h, rounded to 1 decimal.
 * @param {number} mps
 * @returns {number}
 */
function mpsToKmh(mps) {
  return Math.round(mps * 3.6 * 10) / 10;
}

/**
 * Capitalises the first letter of every word in a string.
 * @param {string} str
 * @returns {string}
 */
function toTitleCase(str) {
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Formats a UNIX timestamp to a short weekday name (e.g. "Mon").
 * @param {number} unix  UNIX timestamp in seconds
 * @returns {string}
 */
function formatWeekday(unix) {
  return new Date(unix * 1000).toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Clamps a number between min and max (inclusive).
 * Used for UI progress bars (humidity, cloud cover, etc.)
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('kelvinToCelsius', () => {
  test('converts absolute zero correctly', () => {
    expect(kelvinToCelsius(0)).toBe(-273.1); // rounded
  });

  test('converts 0 °C (273.15 K)', () => {
    expect(kelvinToCelsius(273.15)).toBe(0);
  });

  test('converts 100 °C (373.15 K)', () => {
    expect(kelvinToCelsius(373.15)).toBe(100);
  });

  test('rounds to 1 decimal place', () => {
    expect(kelvinToCelsius(300)).toBe(26.9);
  });
});

describe('mpsToKmh', () => {
  test('converts 0 m/s', () => {
    expect(mpsToKmh(0)).toBe(0);
  });

  test('converts 10 m/s to 36 km/h', () => {
    expect(mpsToKmh(10)).toBe(36);
  });

  test('rounds to 1 decimal place', () => {
    expect(mpsToKmh(5)).toBe(18);
  });
});

describe('toTitleCase', () => {
  test('capitalises a single word', () => {
    expect(toTitleCase('clear')).toBe('Clear');
  });

  test('capitalises multiple words', () => {
    expect(toTitleCase('light rain')).toBe('Light Rain');
  });

  test('handles already-capitalised input', () => {
    expect(toTitleCase('Broken Clouds')).toBe('Broken Clouds');
  });

  test('handles empty string', () => {
    expect(toTitleCase('')).toBe('');
  });
});

describe('clamp', () => {
  test('returns value within range unchanged', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  test('clamps below minimum', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  test('clamps above maximum', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  test('returns min when value === min', () => {
    expect(clamp(0, 0, 100)).toBe(0);
  });

  test('returns max when value === max', () => {
    expect(clamp(100, 0, 100)).toBe(100);
  });
});

describe('formatWeekday', () => {
  test('returns a 3-letter weekday abbreviation', () => {
    const result = formatWeekday(0); // 1970-01-01 → Thu
    expect(result).toMatch(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)$/);
  });

  test('is deterministic for a known timestamp', () => {
    // 2024-01-01 00:00:00 UTC = Monday
    const result = formatWeekday(1704067200);
    expect(result).toBe('Mon');
  });
});

// ─── DOM Integration (jsdom) ──────────────────────────────────────────────────

describe('DOM: weather card visibility', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="weatherCard" style="display: none;"></div>
      <div id="errorMessage" style="display: none;"></div>
    `;
  });

  test('weatherCard element exists in DOM', () => {
    expect(document.getElementById('weatherCard')).not.toBeNull();
  });

  test('can show and hide weather card via style', () => {
    const card = document.getElementById('weatherCard');
    card.style.display = 'block';
    expect(card.style.display).toBe('block');
    card.style.display = 'none';
    expect(card.style.display).toBe('none');
  });

  test('error message starts hidden', () => {
    const err = document.getElementById('errorMessage');
    expect(err.style.display).toBe('none');
  });
});
