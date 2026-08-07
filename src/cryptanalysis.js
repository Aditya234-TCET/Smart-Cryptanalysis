// Cryptanalysis Solvers and Mathematical Statistics

import { ENGLISH_FREQS, getFitness, getDictionaryScore } from './bigrams.js';
import { Caesar, Vigenere, RailFence } from './ciphers.js';
import { predictCipherModel } from './ml_model.js';

// ----------------------------------------------------
// 1. STATISTICAL CALCULATORS
// ----------------------------------------------------

// Calculate letter frequencies in percentages (only A-Z)
export function getLetterFrequencies(text) {
  const freqs = {};
  for (let i = 65; i <= 90; i++) {
    freqs[String.fromCharCode(i)] = 0;
  }
  
  let lettersCount = 0;
  const upper = text.toUpperCase();
  
  for (let char of upper) {
    if (char >= 'A' && char <= 'Z') {
      freqs[char]++;
      lettersCount++;
    }
  }
  
  // Convert to percentages
  if (lettersCount > 0) {
    for (let key in freqs) {
      freqs[key] = (freqs[key] / lettersCount) * 100;
    }
  }
  
  return { freqs, totalLetters: lettersCount };
}

// Calculate Index of Coincidence (IoC)
// Measures how closely the letter frequencies match a random distribution vs English.
// English plaintext ~0.0667, Random text ~0.0385
export function getIndexofCoincidence(text) {
  const upper = text.toUpperCase().replace(/[^A-Z]/g, '');
  const N = upper.length;
  if (N <= 1) return 0;
  
  const counts = Array(26).fill(0);
  for (let i = 0; i < N; i++) {
    counts[upper.charCodeAt(i) - 65]++;
  }
  
  let sum = 0;
  for (let i = 0; i < 26; i++) {
    sum += counts[i] * (counts[i] - 1);
  }
  
  return sum / (N * (N - 1));
}

// Calculate Shannon Entropy
// Measures the randomness of characters in the text.
// Higher entropy means more uniform/random distribution (e.g. polyalphabetic or strong encryption).
export function getEntropy(text) {
  const upper = text.toUpperCase().replace(/[^A-Z]/g, '');
  const N = upper.length;
  if (N === 0) return 0;
  
  const counts = Array(26).fill(0);
  for (let i = 0; i < N; i++) {
    counts[upper.charCodeAt(i) - 65]++;
  }
  
  let entropy = 0;
  for (let i = 0; i < 26; i++) {
    if (counts[i] > 0) {
      const p = counts[i] / N;
      entropy -= p * Math.log2(p);
    }
  }
  
  return entropy;
}

// Calculate Chi-Squared Statistic (lower is better match to English)
export function getChiSquared(text) {
  const upper = text.toUpperCase().replace(/[^A-Z]/g, '');
  const N = upper.length;
  if (N === 0) return Infinity;
  
  const counts = Array(26).fill(0);
  for (let i = 0; i < N; i++) {
    counts[upper.charCodeAt(i) - 65]++;
  }
  
  let chi2 = 0;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 26; i++) {
    const expected = N * ENGLISH_FREQS[alphabet[i]];
    const observed = counts[i];
    chi2 += Math.pow(observed - expected, 2) / expected;
  }
  
  return chi2;
}

// ----------------------------------------------------
// 2. CIPHER TYPE CLASSIFIER (Decision Tree)
// ----------------------------------------------------
export function classifyCipher(text) {
  const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (cleaned.length < 10) {
    return {
      type: "Unknown",
      confidence: 0,
      reason: "Text too short. Please provide at least 10 alphabetical characters for statistical classification.",
      metrics: { ioc: 0, entropy: 0, chi2: 0 }
    };
  }
  
  const ioc = getIndexofCoincidence(cleaned);
  const entropy = getEntropy(cleaned);
  const chi2 = getChiSquared(cleaned);
  
  const dict_match = getDictionaryScore(text);
  const vowels = cleaned.match(/[AEIOU]/g);
  const vowel_ratio = (vowels ? vowels.length : 0) / cleaned.length;
  const unique_ratio = new Set(cleaned).size / cleaned.length;

  const features = [ioc, entropy, chi2, dict_match, vowel_ratio, unique_ratio];
  const mlResult = predictCipherModel(features);

  const nameMap = {
    "Caesar": "Caesar",
    "Monoalphabetic": "Monoalphabetic Substitution",
    "PlainEnglish": "Plain English",
    "Playfair": "Playfair",
    "RailFence": "Rail Fence",
    "Vigenere": "Vigenère"
  };

  let type = nameMap[mlResult.prediction] || mlResult.prediction;

  let probabilities = {};
  for (let key in mlResult.probabilities) {
    const mappedKey = nameMap[key] || key;
    probabilities[mappedKey] = Math.round(mlResult.probabilities[key] * 100);
  }

  let sum = Object.values(probabilities).reduce((a, b) => a + b, 0);
  if (sum > 0) {
    let diff = 100 - sum;
    let maxKey = Object.keys(probabilities).reduce((a, b) => probabilities[a] > probabilities[b] ? a : b);
    probabilities[maxKey] += diff;
  }

  let confidence = probabilities[type] || 0;

  let reason = `Based on ML statistical analysis, ${type} is the most probable cipher (${confidence}%).`;
  
  if (type === "Rail Fence") reason += ` The letter frequencies match standard English well (Chi² = ${chi2.toFixed(2)}), suggesting a transposition cipher.`;
  else if (type === "Caesar") reason += ` A simple shift cipher is likely.`;
  else if (type === "Vigenère") reason += ` The Index of Coincidence (IoC = ${ioc.toFixed(4)}) is low, indicating polyalphabetic smoothing.`;
  else if (type === "Monoalphabetic Substitution") reason += ` High IoC (${ioc.toFixed(4)}) indicates monoalphabetic substitution, but it's not a simple shift.`;
  else if (type === "Plain English") reason += ` This looks like unencrypted English text!`;
  else if (type === "Playfair") reason += ` Characteristics point towards a Playfair digram cipher.`;
  
  return {
    type,
    confidence,
    reason,
    probabilities,
    metrics: {
      ioc,
      entropy,
      chi2
    }
  };
}

// ----------------------------------------------------
// 3. CAESAR CIPHER SOLVER
// ----------------------------------------------------
export function solveCaesar(ciphertext) {
  const results = [];
  
  for (let shift = 0; shift < 26; shift++) {
    const { plaintext } = Caesar.decrypt(ciphertext, shift);
    const chi2 = getChiSquared(plaintext);
    const fitness = getFitness(plaintext);
    
    results.push({
      shift,
      plaintext,
      chi2,
      fitness
    });
  }
  
  // Sort by Chi-squared ascending (lowest is best)
  results.sort((a, b) => a.chi2 - b.chi2);
  
  return {
    bestShift: results[0].shift,
    results
  };
}

// ----------------------------------------------------
// 4. VIGENERE CIPHER SOLVER
// ----------------------------------------------------
export function solveVigenere(ciphertext, maxKeyLength = 20) {
  const cleaned = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
  if (cleaned.length < 5) return { key: '', plaintext: ciphertext, iocScores: [] };
  
  const iocScores = [];
  
  // Step 1: Estimate key length by computing average IoC for period sizes 1..maxKeyLength
  for (let L = 1; L <= maxKeyLength; L++) {
    let totalIoC = 0;
    
    // Split into L cosets
    for (let c = 0; c < L; c++) {
      let coset = '';
      for (let i = c; i < cleaned.length; i += L) {
        coset += cleaned[i];
      }
      totalIoC += getIndexofCoincidence(coset);
    }
    
    const avgIoC = totalIoC / L;
    iocScores.push({ keyLength: L, avgIoC });
  }
  
  // Sort key lengths by avgIoC descending to find best candidates
  const sortedLengths = [...iocScores].sort((a, b) => b.avgIoC - a.avgIoC);
  
  // Select the most likely key length.
  // Note: True key length is usually the smallest peak. For example, if length is 3, 6 will have high IoC too.
  // We look for the first length L that has an IoC > 0.058, or we fallback to the highest.
  let bestLength = sortedLengths[0].keyLength;
  for (let item of sortedLengths) {
    if (item.avgIoC > 0.058) {
      // If we find a divisor of the current best length that also has high IoC, choose it instead
      if (bestLength % item.keyLength === 0 && item.keyLength < bestLength && item.avgIoC > 0.055) {
        bestLength = item.keyLength;
      }
    }
  }
  
  // Step 2: Solve Caesar shift for each of the 'bestLength' cosets
  let key = '';
  for (let c = 0; c < bestLength; c++) {
    let coset = '';
    for (let i = c; i < cleaned.length; i += bestLength) {
      coset += cleaned[i];
    }
    
    // Find Caesar shift that minimizes Chi-squared for this coset
    let bestShift = 0;
    let minChi2 = Infinity;
    for (let shift = 0; shift < 26; shift++) {
      const decryptedCoset = coset.split('').map(char => {
        const code = char.charCodeAt(0) - 65;
        return String.fromCharCode(((code - shift + 26) % 26) + 65);
      }).join('');
      
      const chi2 = getChiSquared(decryptedCoset);
      if (chi2 < minChi2) {
        minChi2 = chi2;
        bestShift = shift;
      }
    }
    
    key += String.fromCharCode(65 + bestShift);
  }
  
  const { plaintext } = Vigenere.decrypt(ciphertext, key);
  
  return {
    bestLength,
    key,
    plaintext,
    iocScores
  };
}

// ----------------------------------------------------
// 5. RAIL FENCE CIPHER SOLVER
// ----------------------------------------------------
export function solveRailFence(ciphertext) {
  const results = [];
  const maxRails = Math.min(15, Math.floor(ciphertext.length / 2));
  
  if (maxRails < 2) {
    return { bestRails: 2, results: [{ rails: 2, plaintext: ciphertext, score: 0 }] };
  }
  
  for (let rails = 2; rails <= maxRails; rails++) {
    const { plaintext } = RailFence.decrypt(ciphertext, rails);
    const fitness = getFitness(plaintext);
    const dictScore = getDictionaryScore(plaintext);
    
    // Combine fitness and dictionary match for a comprehensive score
    const score = fitness + (dictScore * 10.0);
    
    results.push({
      rails,
      plaintext,
      fitness,
      dictScore,
      score
    });
  }
  
  // Sort by combined score descending
  results.sort((a, b) => b.score - a.score);
  
  return {
    bestRails: results[0].rails,
    results
  };
}
