// Cryptographic Algorithms for Smart Cryptanalysis Tool

// Helper: Check if character is a letter
export function isLetter(char) {
  return /[a-zA-Z]/.test(char);
}

// ----------------------------------------------------
// 1. CAESAR CIPHER
// ----------------------------------------------------
export const Caesar = {
  encrypt(text, shift) {
    shift = ((shift % 26) + 26) % 26;
    const steps = [];
    const result = text.split('').map((char, index) => {
      if (isLetter(char)) {
        const isUpper = char === char.toUpperCase();
        const base = isUpper ? 65 : 97;
        const code = char.charCodeAt(0) - base;
        const shiftedCode = (code + shift) % 26;
        const resultChar = String.fromCharCode(shiftedCode + base);
        steps.push({
          index,
          original: char,
          shift,
          result: resultChar,
          code,
          shiftedCode
        });
        return resultChar;
      }
      return char;
    }).join('');
    
    return { ciphertext: result, steps };
  },

  decrypt(text, shift) {
    // Decrypting is just encrypting with (26 - shift)
    shift = ((shift % 26) + 26) % 26;
    const steps = [];
    const result = text.split('').map((char, index) => {
      if (isLetter(char)) {
        const isUpper = char === char.toUpperCase();
        const base = isUpper ? 65 : 97;
        const code = char.charCodeAt(0) - base;
        const shiftedCode = (code - shift + 26) % 26;
        const resultChar = String.fromCharCode(shiftedCode + base);
        steps.push({
          index,
          original: char,
          shift,
          result: resultChar,
          code,
          shiftedCode
        });
        return resultChar;
      }
      return char;
    }).join('');
    
    return { plaintext: result, steps };
  }
};

// ----------------------------------------------------
// 2. VIGENERE CIPHER
// ----------------------------------------------------
export const Vigenere = {
  encrypt(text, key) {
    if (!key) return { ciphertext: text, steps: [] };
    key = key.toLowerCase().replace(/[^a-z]/g, '');
    if (key.length === 0) return { ciphertext: text, steps: [] };

    const steps = [];
    let keyIdx = 0;
    
    const ciphertext = text.split('').map((char, index) => {
      if (isLetter(char)) {
        const isUpper = char === char.toUpperCase();
        const base = isUpper ? 65 : 97;
        const textCode = char.charCodeAt(0) - base;
        const keyChar = key[keyIdx % key.length];
        const shift = keyChar.charCodeAt(0) - 97;
        const shiftedCode = (textCode + shift) % 26;
        const resultChar = String.fromCharCode(shiftedCode + base);
        
        steps.push({
          index,
          original: char,
          keyChar: keyChar.toUpperCase(),
          shift,
          result: resultChar,
          keyIdx: keyIdx % key.length
        });
        
        keyIdx++;
        return resultChar;
      }
      return char;
    }).join('');

    return { ciphertext, steps };
  },

  decrypt(text, key) {
    if (!key) return { plaintext: text, steps: [] };
    key = key.toLowerCase().replace(/[^a-z]/g, '');
    if (key.length === 0) return { plaintext: text, steps: [] };

    const steps = [];
    let keyIdx = 0;
    
    const plaintext = text.split('').map((char, index) => {
      if (isLetter(char)) {
        const isUpper = char === char.toUpperCase();
        const base = isUpper ? 65 : 97;
        const textCode = char.charCodeAt(0) - base;
        const keyChar = key[keyIdx % key.length];
        const shift = keyChar.charCodeAt(0) - 97;
        const shiftedCode = (textCode - shift + 26) % 26;
        const resultChar = String.fromCharCode(shiftedCode + base);
        
        steps.push({
          index,
          original: char,
          keyChar: keyChar.toUpperCase(),
          shift,
          result: resultChar,
          keyIdx: keyIdx % key.length
        });
        
        keyIdx++;
        return resultChar;
      }
      return char;
    }).join('');

    return { plaintext, steps };
  }
};

// ----------------------------------------------------
// 3. PLAYFAIR CIPHER
// ----------------------------------------------------
export const Playfair = {
  // Generate 5x5 matrix
  generateMatrix(key) {
    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // 'J' is omitted / merged with 'I'
    let cleanedKey = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    
    const seen = new Set();
    const matrix = [];
    
    for (let char of cleanedKey) {
      if (!seen.has(char) && alphabet.includes(char)) {
        seen.add(char);
        matrix.push(char);
      }
    }
    
    for (let char of alphabet) {
      if (!seen.has(char)) {
        seen.add(char);
        matrix.push(char);
      }
    }
    
    // Transform into 2D grid
    const grid = [];
    for (let i = 0; i < 25; i += 5) {
      grid.push(matrix.slice(i, i + 5));
    }
    return grid;
  },

  // Helper to find coords
  findCoords(char, grid) {
    char = char === 'J' ? 'I' : char;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (grid[r][c] === char) return { r, c };
      }
    }
    return { r: 0, c: 0 };
  },

  prepareText(text) {
    let clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    const pairs = [];
    
    for (let i = 0; i < clean.length; i += 2) {
      const char1 = clean[i];
      let char2 = clean[i + 1];
      
      if (!char2) {
        pairs.push([char1, 'X']);
      } else if (char1 === char2) {
        pairs.push([char1, 'X']);
        i--; // re-evaluate the second letter on next step
      } else {
        pairs.push([char1, char2]);
      }
    }
    return pairs;
  },

  encrypt(text, key) {
    const grid = this.generateMatrix(key);
    const pairs = this.prepareText(text);
    const steps = [];
    
    const ciphertext = pairs.map(([c1, c2]) => {
      const p1 = this.findCoords(c1, grid);
      const p2 = this.findCoords(c2, grid);
      let r1 = p1.r, c1_col = p1.c;
      let r2 = p2.r, c2_col = p2.c;
      
      let rule = '';
      let enc1 = '', enc2 = '';
      
      if (r1 === r2) {
        // Same row: shift right
        rule = 'Same Row (Shift Right)';
        enc1 = grid[r1][(c1_col + 1) % 5];
        enc2 = grid[r2][(c2_col + 1) % 5];
      } else if (c1_col === c2_col) {
        // Same col: shift down
        rule = 'Same Column (Shift Down)';
        enc1 = grid[(r1 + 1) % 5][c1_col];
        enc2 = grid[(r2 + 1) % 5][c2_col];
      } else {
        // Rectangle: swap columns
        rule = 'Rectangle (Swap Columns)';
        enc1 = grid[r1][c2_col];
        enc2 = grid[r2][c1_col];
      }
      
      steps.push({
        input: [c1, c2],
        output: [enc1, enc2],
        p1,
        p2,
        np1: this.findCoords(enc1, grid),
        np2: this.findCoords(enc2, grid),
        rule
      });
      
      return enc1 + enc2;
    }).join(' ');

    return { ciphertext, grid, steps };
  },

  decrypt(ciphertext, key) {
    const grid = this.generateMatrix(key);
    // Remove all whitespace
    let cleanCipher = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (cleanCipher.length % 2 !== 0) {
      // Pad if invalid ciphertext length
      cleanCipher += 'X';
    }
    
    const pairs = [];
    for (let i = 0; i < cleanCipher.length; i += 2) {
      pairs.push([cleanCipher[i], cleanCipher[i + 1]]);
    }
    
    const steps = [];
    const plaintext = pairs.map(([c1, c2]) => {
      const p1 = this.findCoords(c1, grid);
      const p2 = this.findCoords(c2, grid);
      let r1 = p1.r, c1_col = p1.c;
      let r2 = p2.r, c2_col = p2.c;
      
      let rule = '';
      let dec1 = '', dec2 = '';
      
      if (r1 === r2) {
        // Same row: shift left
        rule = 'Same Row (Shift Left)';
        dec1 = grid[r1][(c1_col - 1 + 5) % 5];
        dec2 = grid[r2][(c2_col - 1 + 5) % 5];
      } else if (c1_col === c2_col) {
        // Same col: shift up
        rule = 'Same Column (Shift Up)';
        dec1 = grid[(r1 - 1 + 5) % 5][c1_col];
        dec2 = grid[(r2 - 1 + 5) % 5][c2_col];
      } else {
        // Rectangle: swap columns
        rule = 'Rectangle (Swap Columns)';
        dec1 = grid[r1][c2_col];
        dec2 = grid[r2][c1_col];
      }
      
      steps.push({
        input: [c1, c2],
        output: [dec1, dec2],
        p1,
        p2,
        np1: this.findCoords(dec1, grid),
        np2: this.findCoords(dec2, grid),
        rule
      });
      
      return dec1 + dec2;
    }).join('');

    return { plaintext, grid, steps };
  }
};

// ----------------------------------------------------
// 4. RAIL FENCE CIPHER
// ----------------------------------------------------
export const RailFence = {
  encrypt(text, rails) {
    if (rails <= 1) return { ciphertext: text, grid: [] };
    
    const fence = Array.from({ length: rails }, () => Array(text.length).fill(null));
    let rail = 0;
    let direction = 1; // 1 = down, -1 = up
    
    for (let i = 0; i < text.length; i++) {
      fence[rail][i] = text[i];
      rail += direction;
      
      if (rail === rails - 1) direction = -1;
      else if (rail === 0) direction = 1;
    }
    
    const ciphertext = fence.flatMap(row => row.filter(char => char !== null)).join('');
    
    return { ciphertext, grid: fence };
  },

  decrypt(ciphertext, rails) {
    if (rails <= 1) return { plaintext: ciphertext, grid: [] };
    
    // We recreate the fence structure with markers
    const fence = Array.from({ length: rails }, () => Array(ciphertext.length).fill(null));
    let rail = 0;
    let direction = 1;
    
    for (let i = 0; i < ciphertext.length; i++) {
      fence[rail][i] = '*'; // marker
      rail += direction;
      
      if (rail === rails - 1) direction = -1;
      else if (rail === 0) direction = 1;
    }
    
    // Fill the markers with ciphertext characters row by row
    let cipherIdx = 0;
    for (let r = 0; r < rails; r++) {
      for (let c = 0; c < ciphertext.length; c++) {
        if (fence[r][c] === '*' && cipherIdx < ciphertext.length) {
          fence[r][c] = ciphertext[cipherIdx++];
        }
      }
    }
    
    // Read the text in zigzag order
    let plaintext = '';
    rail = 0;
    direction = 1;
    for (let i = 0; i < ciphertext.length; i++) {
      plaintext += fence[rail][i];
      rail += direction;
      
      if (rail === rails - 1) direction = -1;
      else if (rail === 0) direction = 1;
    }
    
    return { plaintext, grid: fence };
  }
};

// ----------------------------------------------------
// 5. MONOALPHABETIC SUBSTITUTION CIPHER
// ----------------------------------------------------
export const Substitution = {
  encrypt(text, cipherAlphabet) {
    // cipherAlphabet is a 26-char string e.g. "QWERTYUIOPASDFGHJKLZXCVBNM"
    cipherAlphabet = cipherAlphabet.toUpperCase();
    const plainAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    const steps = {};
    for (let i = 0; i < 26; i++) {
      steps[plainAlphabet[i]] = cipherAlphabet[i];
    }
    
    const ciphertext = text.split('').map(char => {
      if (isLetter(char)) {
        const isUpper = char === char.toUpperCase();
        const lookup = char.toUpperCase();
        const mapped = steps[lookup] || lookup;
        return isUpper ? mapped : mapped.toLowerCase();
      }
      return char;
    }).join('');
    
    return { ciphertext, keyMap: steps };
  },

  decrypt(text, cipherAlphabet) {
    cipherAlphabet = cipherAlphabet.toUpperCase();
    const plainAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    const steps = {};
    for (let i = 0; i < 26; i++) {
      steps[cipherAlphabet[i]] = plainAlphabet[i];
    }
    
    const plaintext = text.split('').map(char => {
      if (isLetter(char)) {
        const isUpper = char === char.toUpperCase();
        const lookup = char.toUpperCase();
        const mapped = steps[lookup] || lookup;
        return isUpper ? mapped : mapped.toLowerCase();
      }
      return char;
    }).join('');
    
    return { plaintext, keyMap: steps };
  }
};
