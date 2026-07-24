// Cryptanalysis Solvers and Mathematical Statistics

import { ENGLISH_FREQS, getFitness, getDictionaryScore } from './bigrams.js';
import { Caesar, Vigenere, RailFence } from './ciphers.js';

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
  
  let type = "Monoalphabetic Substitution";
  let confidence = 50;
  let reason = "";
  
  // 1. Check for Transposition (Rail Fence)
  // If Chi-squared at shift 0 is very low, the letter counts match English exactly!
  if (chi2 < 15.0) {
    type = "Rail Fence";
    confidence = Math.min(95, Math.max(70, (15 - chi2) * 6 + 70));
    reason = `The letter frequencies match standard English frequencies almost perfectly (Chi² = ${chi2.toFixed(2)}, which is very low). This is a strong indicator of a transposition cipher like Rail Fence, where letters are shuffled but not replaced.`;
  }
  // 2. Check for Caesar (Shift)
  // Check if any Caesar shift yields a low Chi-squared
  else {
    let bestShift = -1;
    let minChi2 = Infinity;
    for (let shift = 0; shift < 26; shift++) {
      // Shift characters back
      const decrypted = text.split('').map(char => {
        if (/[a-zA-Z]/.test(char)) {
          const isUpper = char === char.toUpperCase();
          const base = isUpper ? 65 : 97;
          const code = char.charCodeAt(0) - base;
          return String.fromCharCode(((code - shift + 26) % 26) + base);
        }
        return char;
      }).join('');
      
      const score = getChiSquared(decrypted);
      if (score < minChi2) {
        minChi2 = score;
        bestShift = shift;
      }
    }
    
    if (minChi2 < 15.0 && bestShift > 0) {
      type = "Caesar";
      confidence = Math.min(98, Math.max(75, (15 - minChi2) * 5 + 80));
      reason = `A simple Caesar shift of key = ${bestShift} reconstructs standard English letter distributions perfectly (Chi² drops from ${chi2.toFixed(2)} to ${minChi2.toFixed(2)}).`;
    } 
    // 3. Polyalphabetic (Vigenère) vs Monoalphabetic Substitution
    else {
      // Index of Coincidence for English is ~0.0667.
      // For Vigenère, IoC is typically flattened: 0.038 to 0.055.
      if (ioc < 0.055) {
        type = "Vigenère";
        confidence = Math.min(95, Math.max(60, (0.0667 - ioc) * 1200 + 40));
        reason = `The Index of Coincidence (IoC = ${ioc.toFixed(4)}) is low (close to the random baseline of 0.0385). This suggests letter frequencies have been smoothed out, which is typical of polyalphabetic ciphers like Vigenère that use multiple shift alphabets.`;
      } else {
        // High IoC but no Caesar shift works -> Monoalphabetic substitution
        // Let's also check if it's Playfair: Playfair has no J (usually), even letters (after cleaning), and certain digram behaviors.
        const containsJ = cleaned.includes('J');
        const oddLength = cleaned.length % 2 !== 0;
        
        if (!containsJ && cleaned.length > 20 && !/(.)\1/.test(cleaned.substring(0, 20))) {
          // Playfair is double-letter resistant and J-free
          type = "Playfair";
          confidence = 65;
          reason = `The Index of Coincidence (IoC = ${ioc.toFixed(4)}) is high, indicating monoalphabetic property. However, standard Caesar shifts do not work. Additionally, the letter 'J' is absent and there are structural patterns suggesting a 5x5 grid digram substitution (Playfair).`;
        } else {
          type = "Monoalphabetic Substitution";
          confidence = Math.min(95, Math.max(70, (ioc - 0.055) * 2000 + 60));
          reason = `The Index of Coincidence (IoC = ${ioc.toFixed(4)}) is high (close to English 0.0667), showing letters are substituted consistently. However, no Caesar shift fits, which points to a general Monoalphabetic Substitution cipher.`;
        }
      }
    }
  }
  
  return {
    type,
    confidence: Math.round(confidence),
    reason,
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
