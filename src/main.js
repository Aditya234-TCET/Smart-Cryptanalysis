// Main Application Controller
import './style.css';

import { Caesar, Vigenere, Playfair, RailFence, Substitution, isLetter } from './ciphers.js';
import { 
  getLetterFrequencies, 
  getIndexofCoincidence, 
  getEntropy, 
  getChiSquared, 
  classifyCipher, 
  solveCaesar, 
  solveVigenere, 
  solveRailFence 
} from './cryptanalysis.js';
import { 
  renderFrequencyChart, 
  renderCaesarChiChart, 
  renderVigenereIoCChart, 
  renderFitnessProgressChart, 
  updateFitnessChart 
} from './charts.js';

// ----------------------------------------------------
// APPLICATION STATE
// ----------------------------------------------------
const STATE = {
  activeTab: 'sandbox', // 'sandbox' or 'analysis'
  sandboxMode: 'encrypt', // 'encrypt' or 'decrypt'
  selectedCipher: 'caesar',
  worker: null,
  manualSubMap: {},
  // Pre-configured samples for educational demos
  samples: {
    plaintext: "CRYPTOGRAPHY IS THE PRACTICE AND STUDY OF TECHNIQUES FOR SECURE COMMUNICATION IN THE PRESENCE OF THIRD PARTIES. IT IS AN ESSENTIAL EDUCATIONAL COMPONENT FOR COMPUTER SCIENCE AND MATHEMATICAL STUDENTS WORLDWIDE.",
    caesar: "JYFWAVNYHWOF PZ AOL WYHJAPJL HUK ZABKF VM ALJOUPXBLZ MVY ZLJBYL JVTABUPJHAJVU PU AOL WYLZLUAL VM AOPYK WHYAPLZ. PA PZ HU LZZLUAPHAS LKBJHAJVUHS JVTWVULUA MVY JVTWBaly ZJPLUJL HUK THAOLTLAPJHS ZABBLUAZ DVYSKdpkL.",
    vigenere: "VVG GYCKYP AMNFIK KQ SPG MY VVG TCTJMCUV CLF UMMNJCUUR OPCUP AMNFIKU. KV KQ C VNRG MY UWDURKWWVKQP AMNFIK MP YHMAL GCAP NCVVCP MP VVG RPCKPVGZV KQ UFKIVGF FA C HKZGF PCODCP MY RMUKVHQPU FQYP VVG TNRJCLGV. DQV GZCORJG YKRF C UFKIV MY VHTGG C YQWPF DG TGRNCFGF FA F CLF D YQWPF DGEQOG G. VVG OGVJQH KQ PCOGF CHVGP KYNKWU GYCKYP YJQ WUGF KV MP HKU RTKXCVG EQKIGURQPFGPEE.",
    substitution: "EKNZHQAQSNL OY ZIT LZXRN GY EOHITERL QFR EGZRT VKOZIOFU ZG YIOFR VTAQNFTLSETL QFR QZZDHPZ ZG KETCGCEK ZIT GRIUIOFQS HSQIOFZTBT. ZIYL VTW HSQZYGKD OY QF OFZTKQEZOCT ZGGS YGK STQKFOFU LZQZYLZOEQS DTEIGRL QFR EKQEAOFU ESQLLYEQS TFEKNHEOGF E GRATL."
  }
};

// ----------------------------------------------------
// DOM ELEMENTS SELECTORS
// ----------------------------------------------------
const DOM = {
  // Tab Navigation
  tabSandboxBtn: document.getElementById('tab-sandbox-btn'),
  tabAnalysisBtn: document.getElementById('tab-analysis-btn'),
  tabSandbox: document.getElementById('tab-sandbox'),
  tabAnalysis: document.getElementById('tab-analysis'),
  
  // Sandbox Controls
  modeEncrypt: document.getElementById('mode-encrypt'),
  modeDecrypt: document.getElementById('mode-decrypt'),
  cipherSelect: document.getElementById('cipher-select'),
  sandboxInput: document.getElementById('sandbox-input'),
  sandboxOutput: document.getElementById('sandbox-output'),
  inputLabel: document.getElementById('input-label'),
  btnExecute: document.getElementById('btn-execute-cipher'),
  btnLoadSample: document.getElementById('btn-load-sample'),
  btnClearInput: document.getElementById('btn-clear-input'),
  btnCopyOutput: document.getElementById('btn-copy-output'),
  
  // Params Containers
  paramCaesar: document.getElementById('param-caesar'),
  paramVigenere: document.getElementById('param-vigenere'),
  paramPlayfair: document.getElementById('param-playfair'),
  paramRailfence: document.getElementById('param-railfence'),
  paramSubstitution: document.getElementById('param-substitution'),
  
  // Parameter Inputs
  caesarKey: document.getElementById('caesar-key'),
  caesarKeyVal: document.getElementById('caesar-key-val'),
  vigenereKey: document.getElementById('vigenere-key'),
  playfairKey: document.getElementById('playfair-key'),
  railfenceRails: document.getElementById('railfence-rails'),
  railfenceRailsVal: document.getElementById('railfence-rails-val'),
  subKey: document.getElementById('sub-key'),
  btnSubRandom: document.getElementById('btn-sub-random'),
  btnSubReverse: document.getElementById('btn-sub-reverse'),
  btnSubRot13: document.getElementById('btn-sub-rot13'),
  
  // Visualizer Sandboxes
  vizCaesar: document.getElementById('viz-caesar'),
  vizVigenere: document.getElementById('viz-vigenere'),
  vizPlayfair: document.getElementById('viz-playfair'),
  vizRailfence: document.getElementById('viz-railfence'),
  vizSubstitution: document.getElementById('viz-substitution'),
  
  // Visualizer Internal elements
  caesarWheelOuter: document.getElementById('caesar-wheel-outer'),
  caesarWheelInner: document.getElementById('caesar-wheel-inner'),
  vigenereTable: document.getElementById('vigenere-table-element'),
  playfairBoard: document.getElementById('playfair-board-element'),
  playfairTrace: document.getElementById('playfair-trace-element'),
  railfenceGrid: document.getElementById('railfence-grid-element'),
  subRowPlain: document.getElementById('sub-row-plain'),
  subRowCipher: document.getElementById('sub-row-cipher'),
  
  // Cryptanalysis controls
  analysisInput: document.getElementById('analysis-input'),
  btnPullSandbox: document.getElementById('btn-pull-sandbox'),
  btnRunClassifier: document.getElementById('btn-run-classifier'),
  
  // Classifier outputs
  probabilitiesList: document.getElementById('probabilities-list'),
  classifierBar: document.getElementById('classifier-bar'),
  classifierPct: document.getElementById('classifier-pct'),
  predictedCipher: document.getElementById('predicted-cipher'),
  classifierExplanation: document.getElementById('classifier-explanation'),
  statIoC: document.getElementById('stat-ioc'),
  statEntropy: document.getElementById('stat-entropy'),
  statChi: document.getElementById('stat-chi'),
  
  // Solver controls
  solverSelect: document.getElementById('solver-select'),
  btnRunSolver: document.getElementById('btn-run-solver'),
  btnStopSolver: document.getElementById('btn-stop-solver'),
  solverStatusBadge: document.getElementById('solver-status-badge'),
  solverStatusText: document.getElementById('solver-status-text'),
  solverConsole: document.getElementById('solver-console'),
  solverOutput: document.getElementById('solver-output'),
  
  // Solver charts containers
  chartCaesarContainer: document.getElementById('chart-caesar-container'),
  chartVigenereContainer: document.getElementById('chart-vigenere-container'),
  chartFitnessContainer: document.getElementById('chart-fitness-container'),
  interactiveManualSub: document.getElementById('interactive-manual-sub'),
  manualFreqGrid: document.getElementById('manual-freq-grid-element'),
  themeToggleBtn: document.getElementById('theme-toggle'),
  themeIcon: document.getElementById('theme-icon')
};

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initStaticVisualizations();
  document.body.dataset.activeCipher = STATE.selectedCipher;
  runSandboxProcess();
  updateFrequencyCharts();
});

// ----------------------------------------------------
// EVENT LISTENERS BINDING
// ----------------------------------------------------
function setupEventListeners() {
  // Tab Switching
  DOM.tabSandboxBtn.addEventListener('click', () => switchTab('sandbox'));
  DOM.tabAnalysisBtn.addEventListener('click', () => switchTab('analysis'));
  
  // Theme Toggle
  if (DOM.themeToggleBtn) {
    DOM.themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      if (isLight) {
        DOM.themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      } else {
        DOM.themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>';
      }
    });
  }
  
  // Sandbox Mode Toggles
  DOM.modeEncrypt.addEventListener('click', () => {
    DOM.modeEncrypt.classList.add('active');
    DOM.modeDecrypt.classList.remove('active');
    STATE.sandboxMode = 'encrypt';
    DOM.inputLabel.textContent = "Plaintext Message";
    DOM.btnExecute.textContent = "Execute Cipher (Encrypt)";
    runSandboxProcess();
  });
  
  DOM.modeDecrypt.addEventListener('click', () => {
    DOM.modeDecrypt.classList.add('active');
    DOM.modeEncrypt.classList.remove('active');
    STATE.sandboxMode = 'decrypt';
    DOM.inputLabel.textContent = "Ciphertext Message";
    DOM.btnExecute.textContent = "Execute Cipher (Decrypt)";
    runSandboxProcess();
  });
  
  // Cipher dropdown switch
  DOM.cipherSelect.addEventListener('change', (e) => {
    STATE.selectedCipher = e.target.value;
    document.body.dataset.activeCipher = STATE.selectedCipher;
    
    // Toggle parameter panels
    document.querySelectorAll('.cipher-params').forEach(panel => panel.style.display = 'none');
    
    if (STATE.selectedCipher === 'caesar') DOM.paramCaesar.style.display = 'block';
    else if (STATE.selectedCipher === 'vigenere') DOM.paramVigenere.style.display = 'block';
    else if (STATE.selectedCipher === 'playfair') DOM.paramPlayfair.style.display = 'block';
    else if (STATE.selectedCipher === 'railfence') DOM.paramRailfence.style.display = 'block';
    else if (STATE.selectedCipher === 'substitution') DOM.paramSubstitution.style.display = 'block';
    
    // Toggle visualizer panel in workspace
    DOM.vizCaesar.style.display = STATE.selectedCipher === 'caesar' ? 'flex' : 'none';
    DOM.vizVigenere.style.display = STATE.selectedCipher === 'vigenere' ? 'block' : 'none';
    DOM.vizPlayfair.style.display = STATE.selectedCipher === 'playfair' ? 'block' : 'none';
    DOM.vizRailfence.style.display = STATE.selectedCipher === 'railfence' ? 'block' : 'none';
    DOM.vizSubstitution.style.display = STATE.selectedCipher === 'substitution' ? 'flex' : 'none';
    
    runSandboxProcess();
  });
  
  // Parameter listeners
  DOM.caesarKey.addEventListener('input', (e) => {
    DOM.caesarKeyVal.textContent = e.target.value;
    rotateCaesarWheel(parseInt(e.target.value));
  });
  DOM.caesarKey.addEventListener('change', () => runSandboxProcess());
  
  DOM.railfenceRails.addEventListener('input', (e) => {
    DOM.railfenceRailsVal.textContent = e.target.value;
  });
  DOM.railfenceRails.addEventListener('change', () => runSandboxProcess());
  
  DOM.vigenereKey.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    runSandboxProcess();
  });
  
  DOM.playfairKey.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    runSandboxProcess();
  });
  
  DOM.subKey.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    if (e.target.value.length === 26) {
      updateSubstitutionMappingViz(e.target.value);
      runSandboxProcess();
    }
  });
  
  // Substitution presets
  DOM.btnSubRandom.addEventListener('click', () => {
    const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    // Shuffle
    for (let i = abc.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [abc[i], abc[j]] = [abc[j], abc[i]];
    }
    const val = abc.join('');
    DOM.subKey.value = val;
    updateSubstitutionMappingViz(val);
    runSandboxProcess();
  });
  
  DOM.btnSubReverse.addEventListener('click', () => {
    // Atbash
    const val = 'ZYXWVUTSRQPONMLKJIHGFEDCBA';
    DOM.subKey.value = val;
    updateSubstitutionMappingViz(val);
    runSandboxProcess();
  });
  
  DOM.btnSubRot13.addEventListener('click', () => {
    const val = 'NOPQRSTUVWXYZABCDEFGHIJKLM';
    DOM.subKey.value = val;
    updateSubstitutionMappingViz(val);
    runSandboxProcess();
  });
  
  // Core Buttons
  DOM.btnExecute.addEventListener('click', () => runSandboxProcess());
  
  DOM.btnLoadSample.addEventListener('click', () => {
    if (STATE.sandboxMode === 'encrypt') {
      DOM.sandboxInput.value = STATE.samples.plaintext;
    } else {
      if (STATE.selectedCipher === 'caesar') DOM.sandboxInput.value = STATE.samples.caesar;
      else if (STATE.selectedCipher === 'vigenere') DOM.sandboxInput.value = STATE.samples.vigenere;
      else if (STATE.selectedCipher === 'substitution') DOM.sandboxInput.value = STATE.samples.substitution;
      else DOM.sandboxInput.value = Caesar.encrypt(STATE.samples.plaintext, 11).ciphertext; // fallback caesar
    }
    runSandboxProcess();
  });
  
  DOM.btnClearInput.addEventListener('click', () => {
    DOM.sandboxInput.value = '';
    DOM.sandboxOutput.textContent = 'Result will appear here...';
    updateFrequencyCharts();
  });
  
  DOM.btnCopyOutput.addEventListener('click', () => {
    navigator.clipboard.writeText(DOM.sandboxOutput.textContent);
    DOM.btnCopyOutput.textContent = 'Copied!';
    setTimeout(() => DOM.btnCopyOutput.textContent = 'Copy', 1500);
  });
  
  // Cryptanalysis triggers
  DOM.btnPullSandbox.addEventListener('click', () => {
    // If output is placeholder, don't copy
    if (DOM.sandboxOutput.textContent.includes('Result will appear')) return;
    DOM.analysisInput.value = DOM.sandboxOutput.textContent;
    runClassifierProcess();
  });
  
  DOM.btnRunClassifier.addEventListener('click', () => runClassifierProcess());
  
  // Solver actions
  DOM.btnRunSolver.addEventListener('click', () => runDecoderProcess());
  DOM.btnStopSolver.addEventListener('click', () => stopDecoderProcess());
  
  DOM.solverSelect.addEventListener('change', (e) => {
    // Hide all solver visual aids
    DOM.chartCaesarContainer.style.display = 'none';
    DOM.chartVigenereContainer.style.display = 'none';
    DOM.chartFitnessContainer.style.display = 'none';
    DOM.interactiveManualSub.style.display = 'none';
    
    const solver = e.target.value;
    if (solver === 'caesar') DOM.chartCaesarContainer.style.display = 'block';
    else if (solver === 'vigenere') DOM.chartVigenereContainer.style.display = 'block';
    else if (solver === 'substitution-annealing') DOM.chartFitnessContainer.style.display = 'block';
    else if (solver === 'substitution-manual') {
      DOM.interactiveManualSub.style.display = 'block';
      initManualSubstitutionGrid();
    }
  });
}

// ----------------------------------------------------
// TABS NAVIGATION CONTROLLER
// ----------------------------------------------------
function switchTab(tabName) {
  STATE.activeTab = tabName;
  
  if (tabName === 'sandbox') {
    DOM.tabSandboxBtn.classList.add('active');
    DOM.tabAnalysisBtn.classList.remove('active');
    DOM.tabSandbox.classList.add('active');
    DOM.tabAnalysis.classList.remove('active');
  } else {
    DOM.tabAnalysisBtn.classList.add('active');
    DOM.tabSandboxBtn.classList.remove('active');
    DOM.tabAnalysis.classList.add('active');
    DOM.tabSandbox.classList.remove('active');
    
    // Automatically pull from sandbox if empty
    if (DOM.analysisInput.value.length === 0 && !DOM.sandboxOutput.textContent.includes('Result will appear')) {
      DOM.analysisInput.value = DOM.sandboxOutput.textContent;
    }
    
    runClassifierProcess();
  }
}

// ----------------------------------------------------
// SANDBOX ENCRYPTION / DECRYPTION FLOW
// ----------------------------------------------------
function runSandboxProcess() {
  const input = DOM.sandboxInput.value;
  if (!input) return;
  
  let result = '';
  
  if (STATE.sandboxMode === 'encrypt') {
    if (STATE.selectedCipher === 'caesar') {
      const shift = parseInt(DOM.caesarKey.value);
      const res = Caesar.encrypt(input, shift);
      result = res.ciphertext;
      rotateCaesarWheel(shift);
    } 
    else if (STATE.selectedCipher === 'vigenere') {
      const key = DOM.vigenereKey.value || 'KEY';
      const res = Vigenere.encrypt(input, key);
      result = res.ciphertext;
      renderVigenereVisualizer(res.steps);
    } 
    else if (STATE.selectedCipher === 'playfair') {
      const key = DOM.playfairKey.value || 'MONARCHY';
      const res = Playfair.encrypt(input, key);
      result = res.ciphertext;
      renderPlayfairVisualizer(res.grid, res.steps);
    } 
    else if (STATE.selectedCipher === 'railfence') {
      const rails = parseInt(DOM.railfenceRails.value);
      const res = RailFence.encrypt(input, rails);
      result = res.ciphertext;
      renderRailFenceVisualizer(res.grid);
    } 
    else if (STATE.selectedCipher === 'substitution') {
      const alphabet = DOM.subKey.value || 'QWERTYUIOPASDFGHJKLZXCVBNM';
      const res = Substitution.encrypt(input, alphabet);
      result = res.ciphertext;
      updateSubstitutionMappingViz(alphabet);
    }
  } else { // DECRYPT
    if (STATE.selectedCipher === 'caesar') {
      const shift = parseInt(DOM.caesarKey.value);
      const res = Caesar.decrypt(input, shift);
      result = res.plaintext;
      rotateCaesarWheel(shift);
    } 
    else if (STATE.selectedCipher === 'vigenere') {
      const key = DOM.vigenereKey.value || 'KEY';
      const res = Vigenere.decrypt(input, key);
      result = res.plaintext;
      renderVigenereVisualizer(res.steps);
    } 
    else if (STATE.selectedCipher === 'playfair') {
      const key = DOM.playfairKey.value || 'MONARCHY';
      const res = Playfair.decrypt(input, key);
      result = res.plaintext;
      renderPlayfairVisualizer(res.grid, res.steps);
    } 
    else if (STATE.selectedCipher === 'railfence') {
      const rails = parseInt(DOM.railfenceRails.value);
      const res = RailFence.decrypt(input, rails);
      result = res.plaintext;
      renderRailFenceVisualizer(res.grid);
    } 
    else if (STATE.selectedCipher === 'substitution') {
      const alphabet = DOM.subKey.value || 'QWERTYUIOPASDFGHJKLZXCVBNM';
      const res = Substitution.decrypt(input, alphabet);
      result = res.plaintext;
      updateSubstitutionMappingViz(alphabet);
    }
  }
  
  DOM.sandboxOutput.textContent = result;
  DOM.sandboxOutput.classList.remove('output-flash');
  void DOM.sandboxOutput.offsetWidth; // trigger reflow
  DOM.sandboxOutput.classList.add('output-flash');
  
  // Update the visual frequency charts comparing English, cipher, and decrypted
  updateFrequencyCharts();
}

// ----------------------------------------------------
// FREQUENCY ANALYSIS CHARTS UPDATES
// ----------------------------------------------------
function updateFrequencyCharts() {
  const input = DOM.sandboxInput.value;
  const output = DOM.sandboxOutput.textContent;
  
  let cipherText = '';
  let decryptedText = '';
  
  if (STATE.sandboxMode === 'encrypt') {
    cipherText = output;
    decryptedText = input;
  } else {
    cipherText = input;
    decryptedText = output;
  }
  
  // Clean placeholders
  if (cipherText.includes('Result will appear')) cipherText = '';
  if (decryptedText.includes('Result will appear')) decryptedText = '';
  
  const cipherFreqs = getLetterFrequencies(cipherText).freqs;
  const decryptedFreqs = getLetterFrequencies(decryptedText).freqs;
  
  renderFrequencyChart('chart-frequency-analysis', cipherFreqs, decryptedFreqs);
}

// ----------------------------------------------------
// STATIC & INITIAL CIPHER VISUALIZATIONS RENDER
// ----------------------------------------------------
function initStaticVisualizations() {
  // 1. Caesar wheel alphabet loading
  rotateCaesarWheel(3);
  
  // 2. Playfair board initialization
  renderPlayfairVisualizer(Playfair.generateMatrix('MONARCHY'), []);
  
  // 3. Substitution mapping initialization
  updateSubstitutionMappingViz('QWERTYUIOPASDFGHJKLZXCVBNM');
}

// Rotate Caesar Wheel outer & inner rings
function rotateCaesarWheel(shift) {
  const outer = DOM.caesarWheelOuter;
  const inner = DOM.caesarWheelInner;
  
  if (inner.children.length === 0) {
    // Generate outer letters once
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 26; i++) {
      const angle = (i * 360) / 26;
      
      const elOuter = document.createElement('div');
      elOuter.className = 'wheel-letter wheel-outer-letter';
      elOuter.textContent = alphabet[i];
      elOuter.style.transform = `rotate(${angle}deg)`;
      outer.appendChild(elOuter);
      
      const elInner = document.createElement('div');
      elInner.className = 'wheel-letter wheel-inner-letter';
      elInner.textContent = alphabet[i];
      elInner.style.transform = `rotate(${angle}deg)`;
      inner.appendChild(elInner);
    }
  }
  
  // Simply rotate the inner ring
  const angleRotate = (shift * 360) / 26;
  inner.style.transform = `rotate(-${angleRotate}deg)`;
}

// Render Vigenere Tabula Recta Grid
function renderVigenereVisualizer(steps) {
  const table = DOM.vigenereTable;
  table.innerHTML = '';
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // Header row
  const headerRow = document.createElement('tr');
  headerRow.appendChild(document.createElement('th')); // empty corner
  for (let char of alphabet) {
    const th = document.createElement('th');
    th.textContent = char;
    th.id = `vig-col-head-${char}`;
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);
  
  // Rows
  for (let r = 0; r < 26; r++) {
    const tr = document.createElement('tr');
    
    // Row Header (Key offset)
    const rowHead = document.createElement('th');
    rowHead.textContent = alphabet[r];
    rowHead.id = `vig-row-head-${alphabet[r]}`;
    tr.appendChild(rowHead);
    
    for (let c = 0; c < 26; c++) {
      const td = document.createElement('td');
      td.textContent = alphabet[(r + c) % 26];
      td.id = `vig-cell-${alphabet[r]}-${alphabet[c]}`;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  
  // Highlight last step interaction if available
  if (steps && steps.length > 0) {
    const lastStep = steps[steps.length - 1]; // pick the last processed alphabetical character
    const keyChar = lastStep.keyChar;
    const plainChar = lastStep.original.toUpperCase();
    
    // Clear old highlights (not needed on redraw, but let's highlight)
    const rowHeader = document.getElementById(`vig-row-head-${keyChar}`);
    const colHeader = document.getElementById(`vig-col-head-${plainChar}`);
    const cell = document.getElementById(`vig-cell-${keyChar}-${plainChar}`);
    
    if (rowHeader) rowHeader.className = 'highlight-key';
    if (colHeader) colHeader.className = 'highlight-plain';
    if (cell) cell.className = 'highlight-cell';
  }
}

// Render Playfair 5x5 Matrix
function renderPlayfairVisualizer(grid, steps) {
  const board = DOM.playfairBoard;
  board.innerHTML = '';
  
  // Flatten grid
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const cell = document.createElement('div');
      cell.className = 'playfair-cell';
      cell.textContent = grid[r][c];
      cell.id = `playfair-cell-${grid[r][c]}`;
      board.appendChild(cell);
    }
  }
  
  // Render step trace
  if (steps && steps.length > 0) {
    const lastStep = steps[steps.length - 1];
    DOM.playfairTrace.innerHTML = `
      <div style="font-weight:bold; color:var(--primary); margin-bottom: 0.25rem;">Last pair processed: <code>${lastStep.input[0]}${lastStep.input[1]}</code> &rarr; <code>${lastStep.output[0]}${lastStep.output[1]}</code></div>
      <div>Rule applied: <span style="color:var(--accent); font-weight:600;">${lastStep.rule}</span></div>
    `;
    
    // Highlight cells
    const cellP1 = document.getElementById(`playfair-cell-${lastStep.input[0]}`);
    const cellP2 = document.getElementById(`playfair-cell-${lastStep.input[1]}`);
    const cellC1 = document.getElementById(`playfair-cell-${lastStep.output[0]}`);
    const cellC2 = document.getElementById(`playfair-cell-${lastStep.output[1]}`);
    
    if (cellP1) cellP1.classList.add('highlight-p');
    if (cellP2) cellP2.classList.add('highlight-p');
    if (cellC1) cellC1.classList.add('highlight-c');
    if (cellC2) cellC2.classList.add('highlight-c');
  } else {
    DOM.playfairTrace.textContent = "Vibrant grids showing character mapping coordinates in real time.";
  }
}

// Render Rail Fence Zigzag
function renderRailFenceVisualizer(grid) {
  const container = DOM.railfenceGrid;
  container.innerHTML = '';
  
  if (!grid || grid.length === 0) {
    container.textContent = "Enter input text and execute Rail Fence to see the zigzag visualization.";
    return;
  }
  
  // Render table matching rail fence dimensions
  const rails = grid.length;
  const len = grid[0].length;
  
  // Limit visualization columns for layout purposes if text is huge
  const maxVisCols = Math.min(len, 35);
  
  for (let r = 0; r < rails; r++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'rail-fence-row';
    
    for (let c = 0; c < maxVisCols; c++) {
      const cellDiv = document.createElement('div');
      const char = grid[r][c];
      
      if (char !== null) {
        cellDiv.className = 'rail-fence-cell active-char';
        cellDiv.textContent = char === ' ' ? '␣' : char; // show space symbol
      } else {
        cellDiv.className = 'rail-fence-cell empty';
        cellDiv.textContent = '·';
      }
      rowDiv.appendChild(cellDiv);
    }
    
    if (len > maxVisCols) {
      const ellipsis = document.createElement('div');
      ellipsis.className = 'rail-fence-cell empty';
      ellipsis.textContent = '...';
      rowDiv.appendChild(ellipsis);
    }
    
    container.appendChild(rowDiv);
  }
}

// Update substitution map lists
function updateSubstitutionMappingViz(alphabet) {
  const plainRow = DOM.subRowPlain;
  const cipherRow = DOM.subRowCipher;
  
  plainRow.innerHTML = '';
  cipherRow.innerHTML = '';
  
  const plainAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 26; i++) {
    // Plain slot
    const plainBox = document.createElement('div');
    plainBox.className = 'sub-letter-box header';
    plainBox.textContent = plainAlphabet[i];
    plainRow.appendChild(plainBox);
    
    // Cipher slot
    const cipherBox = document.createElement('div');
    const mapping = alphabet[i] || '';
    cipherBox.className = `sub-letter-box ${mapping ? 'mapped' : ''}`;
    cipherBox.textContent = mapping;
    cipherRow.appendChild(cipherBox);
  }
}

// ----------------------------------------------------
// CRYPTANALYSIS STATISTICAL CLASSIFICATION
// ----------------------------------------------------
function runClassifierProcess() {
  const text = DOM.analysisInput.value;
  if (!text) return;
  
  const classification = classifyCipher(text);
  
  // Update text values
  DOM.predictedCipher.textContent = classification.type;
  DOM.classifierExplanation.innerHTML = classification.reason;
  
  DOM.statIoC.textContent = classification.metrics.ioc.toFixed(4);
  DOM.statEntropy.textContent = classification.metrics.entropy.toFixed(4);
  DOM.statChi.textContent = classification.metrics.chi2.toFixed(2);
  
  // Animate prediction meter
  const percent = classification.confidence;
  DOM.classifierPct.textContent = percent + '%';
  
  // Circular bar calculation: radius = 60, circumference = 2 * PI * r = 377
  const offset = 377 - (percent / 100) * 377;
  DOM.classifierBar.style.strokeDashoffset = offset;
  
  // Adjust progress bar color depending on confidence
  if (percent >= 80) {
    DOM.classifierBar.style.stroke = 'var(--secondary)'; // green
  } else if (percent >= 60) {
    DOM.classifierBar.style.stroke = 'var(--primary)'; // blue
  } else {
    DOM.classifierBar.style.stroke = 'var(--accent)'; // orange
  }
  
  // Render probability breakdown
  if (DOM.probabilitiesList) {
    DOM.probabilitiesList.innerHTML = ''; // Clear old
    
    // Convert to array and sort highest to lowest
    const sortedProbs = Object.keys(classification.probabilities)
      .map(key => ({ name: key, pct: classification.probabilities[key] }))
      .sort((a, b) => b.pct - a.pct);
      
    sortedProbs.forEach(item => {
      const probHTML = `
        <div class="prob-item">
          <div class="prob-label-row">
            <span>${item.name}</span>
            <span>${item.pct}%</span>
          </div>
          <div class="prob-bar-bg">
            <div class="prob-bar-fill" style="width: 0%;"></div>
          </div>
        </div>
      `;
      DOM.probabilitiesList.insertAdjacentHTML('beforeend', probHTML);
    });
    
    // Animate width after brief delay
    setTimeout(() => {
      const fills = DOM.probabilitiesList.querySelectorAll('.prob-bar-fill');
      fills.forEach((fill, index) => {
        fill.style.width = sortedProbs[index].pct + '%';
      });
    }, 50);
  }
  
  // Proactively select the matching solver in the solver select panel
  if (classification.type === "Caesar") {
    DOM.solverSelect.value = "caesar";
  } else if (classification.type === "Vigenère") {
    DOM.solverSelect.value = "vigenere";
  } else if (classification.type === "Rail Fence") {
    DOM.solverSelect.value = "railfence";
  } else if (classification.type === "Monoalphabetic Substitution") {
    DOM.solverSelect.value = "substitution-annealing";
  } else if (classification.type === "Playfair") {
    DOM.solverSelect.value = "substitution-annealing"; // fallback solver
  }
  
  // Trigger solver panel updates (display charts/grids)
  DOM.solverSelect.dispatchEvent(new Event('change'));
}

// ----------------------------------------------------
// DECRYPT / CRACKING ENGINES SOLVERS
// ----------------------------------------------------
function runDecoderProcess() {
  const ciphertext = DOM.analysisInput.value;
  if (!ciphertext) {
    alert("Please provide ciphertext before launching automated cryptanalysis.");
    return;
  }
  
  const solverType = DOM.solverSelect.value;
  
  // Clean console and change status badge to running
  DOM.solverConsole.innerHTML = '';
  setSolverStatus('running', 'Analyzing...');
  DOM.solverOutput.textContent = 'Decrypting, please wait...';
  
  if (solverType === 'caesar') {
    logToConsole('Initiating Caesar cipher brute-force...', 'info');
    logToConsole('Performing all 26 shift offsets...', 'info');
    
    setTimeout(() => {
      const { bestShift, results } = solveCaesar(ciphertext);
      
      logToConsole(`Analyzed shifts. Found optimal key: Shift = ${bestShift}`, 'success');
      logToConsole(`Minimum Chi-Squared score: ${results[0].chi2.toFixed(2)}`, 'accent');
      
      // Update output
      DOM.solverOutput.textContent = results[0].plaintext;
      DOM.solverOutput.classList.remove('output-flash');
      void DOM.solverOutput.offsetWidth;
      DOM.solverOutput.classList.add('output-flash');
      setSolverStatus('success', 'Solved');
      
      // Render chart
      renderCaesarChiChart('chart-caesar', results, bestShift);
    }, 100);
  }
  
  else if (solverType === 'vigenere') {
    logToConsole('Initiating Friedman test for key length estimation...', 'info');
    
    setTimeout(() => {
      const { bestLength, key, plaintext, iocScores } = solveVigenere(ciphertext);
      
      logToConsole(`Analyzing coset Index of Coincidence (IoC)...`, 'info');
      logToConsole(`Likely key period identified: ${bestLength}`, 'success');
      logToConsole(`Evaluating letter shifts per coset...`, 'info');
      logToConsole(`Recovered Keyword: "${key}"`, 'accent');
      
      // Update output
      DOM.solverOutput.textContent = plaintext;
      DOM.solverOutput.classList.remove('output-flash');
      void DOM.solverOutput.offsetWidth;
      DOM.solverOutput.classList.add('output-flash');
      setSolverStatus('success', 'Solved');
      
      // Render chart
      renderVigenereIoCChart('chart-vigenere', iocScores, bestLength);
    }, 100);
  }
  
  else if (solverType === 'railfence') {
    logToConsole('Initiating Rail Fence brute-force depth solver...', 'info');
    logToConsole('Evaluating depths 2 to 15 against English bigrams and vocabularies...', 'info');
    
    setTimeout(() => {
      const { bestRails, results } = solveRailFence(ciphertext);
      
      logToConsole(`Best candidates evaluated. Correct rail count identified: ${bestRails}`, 'success');
      logToConsole(`Top scoring options:`, 'info');
      
      results.slice(0, 4).forEach((r, idx) => {
        logToConsole(`Rank ${idx+1}: Rails=${r.rails} | Bigram Score=${r.fitness.toFixed(3)} | Word Match=${(r.dictScore*100).toFixed(0)}%`, 'accent');
      });
      
      // Update output
      DOM.solverOutput.textContent = results[0].plaintext;
      DOM.solverOutput.classList.remove('output-flash');
      void DOM.solverOutput.offsetWidth;
      DOM.solverOutput.classList.add('output-flash');
      setSolverStatus('success', 'Solved');
    }, 100);
  }
  
  else if (solverType === 'substitution-annealing') {
    logToConsole('Spawning Web Worker for Simulated Annealing heuristic search...', 'info');
    logToConsole('Space complexity = 26! combinations.', 'info');
    logToConsole('Initializing starting key map using letter frequencies...', 'info');
    
    // Toggle start/stop button layout
    DOM.btnRunSolver.style.display = 'none';
    DOM.btnStopSolver.style.display = 'inline-flex';
    
    // Render empty chart
    renderFitnessProgressChart('chart-fitness');
    
    // Setup Worker
    if (STATE.worker) STATE.worker.terminate();
    
    // Start worker from worker.js
    // Note: In Vite, workers are sometimes loaded as new Worker(new URL('./worker.js', import.meta.url))
    try {
      STATE.worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    } catch(err) {
      // Fallback for standard script workers in case type:module fails in some browsers
      STATE.worker = new Worker(new URL('./worker.js', import.meta.url));
    }
    
    STATE.worker.postMessage({
      action: 'start',
      data: { ciphertext }
    });
    
    STATE.worker.onmessage = function (e) {
      const { status, data, message } = e.data;
      
      if (status === 'progress') {
        const { plaintext, keyMap, fitness, iteration, temperature } = data;
        
        DOM.solverOutput.textContent = plaintext;
        updateFitnessChart(fitness, iteration);
        
        // Log updates occasionally to console
        if (iteration % 1200 === 0 || iteration === 300) {
          logToConsole(`Iter: ${iteration} | Temp: ${temperature.toFixed(4)} | Fitness: ${fitness.toFixed(4)}`, 'accent');
        }
      }
      
      else if (status === 'done') {
        const { plaintext, fitness, iteration } = data;
        logToConsole(`Simulated Annealing completed! Iterations: ${iteration}`, 'success');
        logToConsole(`Final plaintext fitness score: ${fitness.toFixed(4)}`, 'success');
        DOM.solverOutput.textContent = plaintext;
        DOM.solverOutput.classList.remove('output-flash');
        void DOM.solverOutput.offsetWidth;
        DOM.solverOutput.classList.add('output-flash');
        
        setSolverStatus('success', 'Completed');
        DOM.btnRunSolver.style.display = 'inline-flex';
        DOM.btnStopSolver.style.display = 'none';
      }
      
      else if (status === 'stopped') {
        logToConsole('Annealing solver stopped manually.', 'accent');
        setSolverStatus('idle', 'Aborted');
        DOM.btnRunSolver.style.display = 'inline-flex';
        DOM.btnStopSolver.style.display = 'none';
      }
      
      else if (status === 'error') {
        logToConsole(`Error: ${message}`, 'info');
        setSolverStatus('idle', 'Error');
        DOM.btnRunSolver.style.display = 'inline-flex';
        DOM.btnStopSolver.style.display = 'none';
      }
    };
  }
}

function stopDecoderProcess() {
  if (STATE.worker) {
    STATE.worker.postMessage({ action: 'stop' });
    DOM.btnRunSolver.style.display = 'inline-flex';
    DOM.btnStopSolver.style.display = 'none';
  }
}

// ----------------------------------------------------
// MANUAL SUBSTITUTION GRIDS & FREQUENCY MATCHING
// ----------------------------------------------------
function initManualSubstitutionGrid() {
  const container = DOM.manualFreqGrid;
  container.innerHTML = '';
  
  const ciphertext = DOM.analysisInput.value.toUpperCase();
  if (!ciphertext) return;
  
  const cleaned = ciphertext.replace(/[^A-Z]/g, '');
  const freqsData = getLetterFrequencies(cleaned).freqs;
  
  // Sort letters by counts descending
  const lettersSorted = Object.keys(freqsData).map(l => ({ letter: l, pct: freqsData[l] }))
                                             .sort((a, b) => b.pct - a.pct);
  
  // Reset manual map
  STATE.manualSubMap = {};
  
  lettersSorted.forEach(item => {
    // If character frequency is 0, ignore
    if (item.pct === 0) return;
    
    // Setup initial mapping: just empty
    STATE.manualSubMap[item.letter] = '';
    
    const cell = document.createElement('div');
    cell.className = 'freq-cell-pair';
    
    cell.innerHTML = `
      <div class="freq-cell-label">${item.letter}</div>
      <div class="freq-cell-val">${item.pct.toFixed(1)}%</div>
      <input type="text" maxlength="1" class="freq-cell-input" id="man-sub-${item.letter}" style="text-transform:uppercase;" />
    `;
    
    container.appendChild(cell);
    
    // Bind change listener
    const input = cell.querySelector('input');
    input.addEventListener('input', (e) => {
      const char = e.target.value.toUpperCase();
      STATE.manualSubMap[item.letter] = char;
      applyManualSubstitutionDecryption();
    });
  });
}

function applyManualSubstitutionDecryption() {
  const ciphertext = DOM.analysisInput.value;
  
  const decrypted = ciphertext.split('').map(char => {
    if (/[a-zA-Z]/.test(char)) {
      const isUpper = char === char.toUpperCase();
      const look = char.toUpperCase();
      const mapped = STATE.manualSubMap[look] || '_'; // Underscore if unmapped
      return isUpper ? mapped : mapped.toLowerCase();
    }
    return char;
  }).join('');
  
  DOM.solverOutput.textContent = decrypted;
}

// ----------------------------------------------------
// CONSOLE / LOGGER HELPERS
// ----------------------------------------------------
function logToConsole(message, type = 'info') {
  const consoleEl = DOM.solverConsole;
  const line = document.createElement('div');
  line.className = `terminal-line ${type}`;
  
  const time = new Date().toLocaleTimeString();
  line.innerHTML = `<span style="color:var(--text-muted); font-size:0.75rem;">[${time}]</span> ${message}`;
  
  consoleEl.appendChild(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function setSolverStatus(status, text) {
  const badge = DOM.solverStatusBadge;
  const label = DOM.solverStatusText;
  
  badge.className = `status-badge ${status}`;
  label.textContent = text;
}
