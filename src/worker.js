// Web Worker for Monoalphabetic Substitution Cipher Solving (Simulated Annealing)

// Standard English bigram log frequencies copied for self-contained execution in Worker
const BIGRAM_LOGS = {
  "TH": -1.5, "HE": -1.7, "IN": -1.8, "ER": -1.9, "AN": -2.0,
  "RE": -2.0, "ND": -2.1, "AT": -2.1, "ON": -2.1, "NT": -2.2,
  "HA": -2.2, "ES": -2.2, "ST": -2.3, "EN": -2.3, "ED": -2.3,
  "TO": -2.4, "IT": -2.4, "OU": -2.4, "EA": -2.5, "HI": -2.5,
  "IS": -2.5, "OR": -2.5, "TI": -2.6, "AS": -2.6, "TE": -2.6,
  "ET": -2.6, "NG": -2.6, "OF": -2.7, "AL": -2.7, "DE": -2.7,
  "SE": -2.7, "LE": -2.7, "CO": -2.8, "SA": -2.8, "VE": -2.8,
  "RO": -2.8, "LI": -2.8, "RI": -2.9, "SH": -2.9, "UT": -2.9,
  "NE": -2.9, "AR": -2.9, "WA": -3.0, "WE": -3.0, "ME": -3.0,
  "UR": -3.0, "TA": -3.0, "OM": -3.0, "DO": -3.1, "CA": -3.1,
  "MA": -3.1, "CH": -3.1, "US": -3.1, "LO": -3.2, "FO": -3.2,
  "PE": -3.2, "LY": -3.2, "DI": -3.2, "HO": -3.2, "LL": -3.3,
  "MI": -3.3, "WH": -3.3, "CE": -3.3, "TR": -3.3, "EC": -3.3,
  "SI": -3.4, "YO": -3.4, "NO": -3.4, "OP": -3.4, "IM": -3.4,
  "LA": -3.4, "FE": -3.4, "PL": -3.5, "MO": -3.5, "GE": -3.5,
  "KE": -3.5, "PR": -3.5, "WI": -3.5, "KI": -3.5, "SO": -3.6,
  "BE": -3.6, "VI": -3.6, "BO": -3.6, "PA": -3.6, "SU": -3.6,
  "RA": -3.6, "AD": -3.6, "RO": -3.6, "IL": -3.7, "UN": -3.7,
  "WO": -3.7, "BY": -3.7, "FI": -3.7, "AC": -3.7, "OW": -3.7,
  "GH": -3.8, "IV": -3.8, "AB": -3.8, "TH": -3.8, "NE": -3.8,
  "OD": -3.9, "JE": -4.0, "QU": -4.0, "RU": -4.1, "MY": -4.1,
  "ZE": -4.5, "ZA": -4.6, "ZO": -4.7, "XY": -5.0, "QW": -5.2
};
const DEFAULT_PENALTY = -7.0;

// English sorted by frequency: E, T, A, O, I, N, S, H, R, D, L, C, U, M, W, F, G, Y, P, B, V, K, J, X, Q, Z
const ENGLISH_BY_FREQ = "ETAOINSHRDLCUMWFGYPBVKJXQZ";

function getFitness(text) {
  let score = 0;
  let count = 0;
  
  for (let i = 0; i < text.length - 1; i++) {
    const bigram = text.substring(i, i + 2);
    const logVal = BIGRAM_LOGS[bigram] !== undefined ? BIGRAM_LOGS[bigram] : DEFAULT_PENALTY;
    score += logVal;
    count++;
  }
  
  return count > 0 ? score / count : -10.0;
}

// Decrypt ciphertext using decryption key map
// key: 26-char array representing decrypted letter for A-Z
function decrypt(text, keyMap) {
  const result = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      result.push(keyMap[code - 65]);
    } else {
      result.push(char);
    }
  }
  return result.join('');
}

// State variables
let running = false;
let ciphertext = "";
let cleanedCipher = "";

// Web Worker message listener
self.onmessage = function (e) {
  const { action, data } = e.data;
  
  if (action === "start") {
    ciphertext = data.ciphertext.toUpperCase();
    cleanedCipher = ciphertext.replace(/[^A-Z]/g, '');
    
    if (cleanedCipher.length < 15) {
      self.postMessage({
        status: "error",
        message: "Ciphertext is too short. Please provide at least 15 alphabetical characters."
      });
      return;
    }
    
    running = true;
    solveSubstitution();
  } else if (action === "stop") {
    running = false;
  }
};

function solveSubstitution() {
  // 1. Initial key using Letter Frequency Analysis
  const counts = Array(26).fill(0).map((_, i) => ({ letter: String.fromCharCode(65 + i), count: 0 }));
  for (let i = 0; i < cleanedCipher.length; i++) {
    counts[cleanedCipher.charCodeAt(i) - 65].count++;
  }
  
  // Sort cipher letters by frequency descending
  counts.sort((a, b) => b.count - a.count);
  
  // Initialize decryption key mapping
  // key[cipherLetter - 'A'] = plainLetter
  const key = Array(26).fill('');
  
  // Map sorted cipher letters to English letters sorted by frequency
  const mappedSet = new Set();
  for (let i = 0; i < 26; i++) {
    const cipherLetter = counts[i].letter;
    const plainLetter = ENGLISH_BY_FREQ[i];
    key[cipherLetter.charCodeAt(0) - 65] = plainLetter;
    mappedSet.add(plainLetter);
  }
  
  // Fill any empty mappings (just in case)
  const remainingLetters = ENGLISH_BY_FREQ.split('').filter(l => !mappedSet.has(l));
  let remIdx = 0;
  for (let i = 0; i < 26; i++) {
    if (!key[i]) {
      key[i] = remainingLetters[remIdx++];
    }
  }
  
  // 2. Simulated Annealing parameters
  let currentKey = [...key];
  let currentPlain = decrypt(cleanedCipher, currentKey);
  let currentScore = getFitness(currentPlain);
  
  let bestKey = [...currentKey];
  let bestScore = currentScore;
  
  let T = 1.0;
  const coolingRate = 0.0003;
  const minT = 0.0005;
  let iteration = 0;
  
  function processChunk() {
    if (!running) {
      self.postMessage({
        status: "stopped",
        data: {
          plaintext: decrypt(ciphertext, bestKey),
          keyMap: buildKeyMap(bestKey),
          fitness: bestScore,
          iteration
        }
      });
      return;
    }
    
    // Run 300 iterations per chunk to prevent UI lockup and process messages
    for (let i = 0; i < 300; i++) {
      iteration++;
      
      // Swap two random letters in the key
      const idx1 = Math.floor(Math.random() * 26);
      let idx2 = Math.floor(Math.random() * 26);
      while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * 26);
      }
      
      const newKey = [...currentKey];
      const temp = newKey[idx1];
      newKey[idx1] = newKey[idx2];
      newKey[idx2] = temp;
      
      const newPlain = decrypt(cleanedCipher, newKey);
      const newScore = getFitness(newPlain);
      
      const diff = newScore - currentScore;
      
      // Accept condition
      if (diff > 0 || Math.exp(diff / T) > Math.random()) {
        currentKey = newKey;
        currentScore = newScore;
        currentPlain = newPlain;
        
        if (currentScore > bestScore) {
          bestScore = currentScore;
          bestKey = [...currentKey];
        }
      }
      
      // Cool down
      T = Math.max(minT, T * (1 - coolingRate));
    }
    
    // Post intermediate progress
    const decryptedSample = decrypt(ciphertext, bestKey);
    self.postMessage({
      status: "progress",
      data: {
        plaintext: decryptedSample,
        keyMap: buildKeyMap(bestKey),
        fitness: bestScore,
        iteration,
        temperature: T
      }
    });
    
    // Check if we hit termination condition
    if (T <= minT || iteration >= 12000) {
      running = false;
      self.postMessage({
        status: "done",
        data: {
          plaintext: decrypt(ciphertext, bestKey),
          keyMap: buildKeyMap(bestKey),
          fitness: bestScore,
          iteration
        }
      });
    } else {
      setTimeout(processChunk, 5); // yielding back to browser loop
    }
  }
  
  processChunk();
}

// Convert flat key array to a key map object (Cipher -> Plain)
function buildKeyMap(keyArray) {
  const map = {};
  for (let i = 0; i < 26; i++) {
    map[String.fromCharCode(65 + i)] = keyArray[i];
  }
  return map;
}
