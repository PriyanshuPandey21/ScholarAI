/**
 * ============================================================
 * ScholarAI — Gemini API Client
 * Central handler for all Gemini API calls across all routes.
 *
 * Features:
 *  - Supports up to 10 API keys (GEMINI_KEY_1 ... GEMINI_KEY_10)
 *  - Automatic failover on quota / rate-limit / permission errors
 *  - Per-key usage tracking
 *  - Cooldown system: temporarily disables a failing key for 5 mins
 *  - Prioritises key with lowest usage count
 *  - Structured console logging for easy debugging
 *  - JSON-safe parsing helper (strips markdown code fences)
 * ============================================================
 */

import { GoogleGenAI } from '@google/genai';

// ─── Config ──────────────────────────────────────────────────
const COOLDOWN_MS   = 5 * 60 * 1000; // 5 minutes
const RETRY_DELAY   = 600;            // ms between key switches
const MAX_RETRIES   = 3;              // max attempts per call

// Error status codes that trigger key rotation
const ROTATABLE_STATUS = new Set([429, 403, 500, 503]);
const ROTATABLE_MSGS   = ['quota', 'rate limit', 'exceeded', 'permission', 'too many', 'resource exhausted', 'timeout', '429', '403'];

// ─── Load All Keys ───────────────────────────────────────────
function loadKeys() {
  const keys = [];
  // Support GEMINI_API_KEY (legacy single-key) as KEY_1 fallback
  for (let i = 1; i <= 10; i++) {
    const val = process.env[`GEMINI_KEY_${i}`];
    if (val && val.trim() && val !== `your_gemini_key_${i}_here`) {
      keys.push(val.trim());
    }
  }
  // Fallback: legacy single key
  if (keys.length === 0) {
    const legacy = process.env.GEMINI_API_KEY;
    if (legacy && legacy !== 'your_gemini_api_key_here') keys.push(legacy);
  }
  return keys;
}

// ─── Key State ───────────────────────────────────────────────
const apiKeys = loadKeys();

const keyStats = apiKeys.map((key, i) => ({
  index:      i,
  keyPreview: `...${key.slice(-6)}`,
  uses:       0,
  failures:   0,
  disabledUntil: null, // timestamp when cooldown ends (or null = active)
}));

// ─── Helpers ─────────────────────────────────────────────────
function isKeyAvailable(stat) {
  if (!stat.disabledUntil) return true;
  if (Date.now() >= stat.disabledUntil) {
    stat.disabledUntil = null; // cooldown expired — re-enable
    console.log(`[GeminiClient] 🔄 Key ${stat.index + 1} (${stat.keyPreview}) cooldown expired — re-enabled`);
    return true;
  }
  return false;
}

function getBestKeyIndex() {
  const available = keyStats
    .filter(isKeyAvailable)
    .sort((a, b) => a.uses - b.uses); // prefer least-used

  return available.length > 0 ? available[0].index : -1;
}

function disableKey(index) {
  keyStats[index].disabledUntil = Date.now() + COOLDOWN_MS;
  console.warn(
    `[GeminiClient] ⛔ Key ${index + 1} (${keyStats[index].keyPreview}) disabled for ${COOLDOWN_MS / 60000} min due to repeated failures`
  );
}

function isRotatableError(error) {
  const msg  = (error?.message || '').toLowerCase();
  const code = error?.status || error?.response?.status;
  if (ROTATABLE_STATUS.has(code)) return true;
  return ROTATABLE_MSGS.some(kw => msg.includes(kw));
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Strip JSON from Gemini markdown code fences
function stripCodeFence(text) {
  let s = text.trim();
  if (s.startsWith('```json')) s = s.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  else if (s.startsWith('```'))   s = s.replace(/^```\s*/, '').replace(/\s*```$/, '');
  return s;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * callGemini — core function used by all routes.
 *
 * @param {string} prompt          - The prompt / content to send
 * @param {object} options         - Optional settings
 * @param {string} options.systemInstruction
 * @param {number} options.temperature   default: 0.5
 * @param {string} options.model         default: gemini-2.5-flash
 * @returns {Promise<string>}      - Raw response text from Gemini
 */
export async function callGemini(prompt, options = {}) {
  if (apiKeys.length === 0) {
    throw new Error('No Gemini API keys configured. Add GEMINI_KEY_1 ... GEMINI_KEY_N to your .env file.');
  }

  const {
    systemInstruction = '',
    temperature       = 0.5,
    model             = 'gemini-2.5-flash',
  } = options;

  let lastError = null;
  let attempts  = 0;

  while (attempts < MAX_RETRIES) {
    const keyIdx = getBestKeyIndex();

    if (keyIdx === -1) {
      // All keys are on cooldown — wait for earliest to recover
      const soonest = keyStats
        .filter(s => s.disabledUntil)
        .sort((a, b) => a.disabledUntil - b.disabledUntil)[0];
      const waitMs = soonest ? Math.max(0, soonest.disabledUntil - Date.now()) : RETRY_DELAY;
      console.warn(`[GeminiClient] 🕒 All keys on cooldown. Waiting ${Math.round(waitMs / 1000)}s...`);
      await sleep(waitMs);
      attempts++;
      continue;
    }

    const stat  = keyStats[keyIdx];
    const aiKey = apiKeys[keyIdx];

    console.log(`[GeminiClient] 🔑 Attempt ${attempts + 1}/${MAX_RETRIES} using Key ${keyIdx + 1} (${stat.keyPreview}) | uses: ${stat.uses}`);

    try {
      const ai = new GoogleGenAI({ apiKey: aiKey });

      const config = { temperature };
      if (systemInstruction) config.systemInstruction = systemInstruction;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      // Success
      stat.uses++;
      console.log(`[GeminiClient] ✅ Success — Key ${keyIdx + 1} | Total uses: ${stat.uses}`);
      return response.text;

    } catch (err) {
      stat.failures++;
      lastError = err;

      console.error(
        `[GeminiClient] ❌ Key ${keyIdx + 1} (${stat.keyPreview}) failed on attempt ${attempts + 1}: ${err.message}`
      );

      if (isRotatableError(err)) {
        // Disable this key after multiple failures
        if (stat.failures >= 2) disableKey(keyIdx);
        await sleep(RETRY_DELAY);
        attempts++;
      } else {
        // Non-rotatable error (e.g. bad prompt, JSON parse) — throw immediately
        throw err;
      }
    }
  }

  console.error('[GeminiClient] 💥 All retries exhausted. Last error:', lastError?.message);
  throw new Error('AI service is busy. Please try again after some time.');
}

/**
 * callGeminiJSON — calls Gemini and parses the response as JSON.
 * Strips markdown fences automatically.
 *
 * @param {string} prompt
 * @param {object} options  - same as callGemini
 * @returns {Promise<object>}
 */
export async function callGeminiJSON(prompt, options = {}) {
  const text   = await callGemini(prompt, options);
  const clean  = stripCodeFence(text);
  try {
    return JSON.parse(clean);
  } catch (parseErr) {
    console.error('[GeminiClient] ⚠️ JSON parse failed. Raw text snippet:', clean.slice(0, 300));
    throw new Error('AI returned an unexpected format. Please try again.');
  }
}

/**
 * getKeyStats — returns sanitized usage stats (no key values exposed)
 */
export function getKeyStats() {
  return keyStats.map(s => ({
    key:          `Key ${s.index + 1}`,
    preview:      s.keyPreview,
    uses:         s.uses,
    failures:     s.failures,
    available:    isKeyAvailable(s),
    cooldownLeft: s.disabledUntil
      ? `${Math.max(0, Math.round((s.disabledUntil - Date.now()) / 1000))}s`
      : null,
  }));
}

export const totalKeys = apiKeys.length;
