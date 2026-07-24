// Chart Management Helpers using Chart.js

import { Chart, registerables } from 'chart.js';
import { ENGLISH_FREQS } from './bigrams.js';

Chart.register(...registerables);

// Chart instances store to prevent memory leaks and "Canvas already in use" errors
const activeCharts = {};

function destroyChart(name) {
  if (activeCharts[name]) {
    activeCharts[name].destroy();
    delete activeCharts[name];
  }
}

// ----------------------------------------------------
// 1. LETTER FREQUENCY COMPARISON CHART
// ----------------------------------------------------
export function renderFrequencyChart(canvasId, cipherFreqs = {}, decryptedFreqs = {}) {
  destroyChart('freq');
  
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  const englishData = labels.map(l => ENGLISH_FREQS[l] * 100);
  const cipherData = labels.map(l => cipherFreqs[l] || 0);
  const decryptedData = labels.map(l => decryptedFreqs[l] || 0);
  
  activeCharts['freq'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'English Baseline',
          data: englishData,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderColor: 'rgba(255, 255, 255, 0.4)',
          borderWidth: 1,
          type: 'line',
          tension: 0.4,
          pointRadius: 2,
          order: 1
        },
        {
          label: 'Ciphertext',
          data: cipherData,
          backgroundColor: 'rgba(255, 0, 127, 0.65)', // neon pink
          borderColor: '#ff007f',
          borderWidth: 1.5,
          borderRadius: 3,
          order: 2
        },
        {
          label: 'Decrypted',
          data: decryptedData,
          backgroundColor: 'rgba(6, 214, 160, 0.65)', // neon mint
          borderColor: '#06d6a0',
          borderWidth: 1.5,
          borderRadius: 3,
          order: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { family: 'Inter' } }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#e2e8f0',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono' } }
        },
        y: {
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: { color: '#94a3b8', callback: val => val + '%' }
        }
      }
    }
  });
}

// ----------------------------------------------------
// 2. CAESAR CHI-SQUARED SCORE CHART
// ----------------------------------------------------
export function renderCaesarChiChart(canvasId, chi2Results = [], correctShift = 0) {
  destroyChart('caesar');
  
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  // Sort results by shift number to display chronologically (0 to 25)
  const sorted = [...chi2Results].sort((a, b) => a.shift - b.shift);
  
  const labels = sorted.map(r => `Shift ${r.shift}`);
  const data = sorted.map(r => r.chi2);
  
  // Highlight the correct shift in neon mint, others in neon cyan
  const backgroundColors = sorted.map(r => 
    r.shift === correctShift ? 'rgba(6, 214, 160, 0.8)' : 'rgba(0, 240, 255, 0.35)'
  );
  const borderColors = sorted.map(r => 
    r.shift === correctShift ? '#06d6a0' : '#00f0ff'
  );
  
  activeCharts['caesar'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Chi-squared Statistic',
        data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1.5,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#e2e8f0',
          bodyColor: '#cbd5e1',
          callbacks: {
            label: context => ` Chi²: ${context.parsed.y.toFixed(2)} (Lower is better)`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.2)' },
          ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 9 }, maxRotation: 45 }
        },
        y: {
          grid: { color: 'rgba(51, 65, 85, 0.2)' },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

// ----------------------------------------------------
// 3. VIGENERE INDEX OF COINCIDENCE CHART
// ----------------------------------------------------
export function renderVigenereIoCChart(canvasId, iocResults = [], bestLength = 0) {
  destroyChart('vigenere');
  
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  const sorted = [...iocResults].sort((a, b) => a.keyLength - b.keyLength);
  
  const labels = sorted.map(r => `Len ${r.keyLength}`);
  const data = sorted.map(r => r.avgIoC);
  
  const backgroundColors = sorted.map(r => 
    r.keyLength === bestLength ? 'rgba(6, 214, 160, 0.8)' : 'rgba(255, 0, 127, 0.35)' // neon pink
  );
  const borderColors = sorted.map(r => 
    r.keyLength === bestLength ? '#06d6a0' : '#ff007f'
  );
  
  activeCharts['vigenere'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Average IoC',
        data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1.5,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        annotation: {
          // Chart.js annotation requires a separate plugin registration, but we can do horizontal lines manually using chart drawing or custom ticks,
          // or we can just explain it in the tooltips / label to avoid external plugin dependencies.
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#e2e8f0',
          bodyColor: '#cbd5e1',
          callbacks: {
            label: context => ` IoC: ${context.parsed.y.toFixed(4)} (English: ~0.0667, Random: ~0.0385)`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.2)' },
          ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 9 } }
        },
        y: {
          grid: { color: 'rgba(51, 65, 85, 0.2)' },
          ticks: { color: '#94a3b8' },
          min: 0.03,
          max: 0.08
        }
      }
    }
  });
}

// ----------------------------------------------------
// 4. SUBSTITUTION FITNESS PROGRESS CHART
// ----------------------------------------------------
export function renderFitnessProgressChart(canvasId) {
  destroyChart('fitness');
  
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  activeCharts['fitness'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Bigram Fitness Score',
        data: [],
        borderColor: '#06d6a0',
        backgroundColor: 'rgba(6, 214, 160, 0.1)',
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#e2e8f0',
          bodyColor: '#cbd5e1'
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 8 } }
        },
        y: {
          grid: { color: 'rgba(51, 65, 85, 0.2)' },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

export function updateFitnessChart(score, iteration) {
  const chart = activeCharts['fitness'];
  if (!chart) return;
  
  chart.data.labels.push(iteration);
  chart.data.datasets[0].data.push(score);
  
  // Cap chart length at 100 data points to prevent lag
  if (chart.data.labels.length > 100) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  
  chart.update('none'); // silent update without animation
}
