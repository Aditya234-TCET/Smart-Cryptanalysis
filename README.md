# 🔐 Smart Cryptanalysis Tool & Educational Sandbox

An interactive, web-based educational platform and automated cryptanalysis suite for classical ciphers and machine-learning-inspired frequency solvers. Designed for students, educators, and cybersecurity enthusiasts to explore, visualize, and crack classical cryptography in real time.

---

## 🌟 Features

### 🛝 1. Interactive Cipher Sandbox
- **Multiple Classical Ciphers Supported**:
  - **Caesar Cipher** (Shift Cipher with adjustable slider key offset)
  - **Vigenère Cipher** (Polyalphabetic key-based substitution)
  - **Playfair Cipher** (5x5 digram grid matrix)
  - **Rail Fence Cipher** (Zigzag transposition depth slider)
  - **Monoalphabetic Substitution** (Custom key, Atbash reverse, ROT13, and Key Randomizer)
- **Live Mathematical & Spatial Visualizations**:
  - Rotating concentric Caesar Cipher Wheel
  - Vigenère *Tabula Recta* matrix lookup
  - Playfair 5x5 Grid matrix with rule tracing
  - Rail Fence periodic zigzag wave path rendering
  - 26-character Substitution Mapping table

---

### 🔬 2. Automated Cryptanalysis Suite
- **Cipher Classifier & Statistical Engine**:
  - Real-time text analysis computing **Index of Coincidence (IoC)**, **Shannon Entropy**, and **Chi-Squared ($\chi^2$) baseline**.
  - Circular match confidence dial automatically predicting cipher types.
- **Automated Solvers**:
  - **Caesar Solver**: Chi-squared minimization algorithm across all 26 shifts.
  - **Vigenère Solver**: Friedman test & coset IoC peak analysis to deduce key length and keyword.
  - **Rail Fence Solver**: Brute-force rail search evaluated with English dictionary word scoring.
  - **Substitution Solver (Simulated Annealing AI)**: Multi-threaded Web Worker running heuristic stochastic hill-climbing using bigram log-probability scores to crack general monoalphabetic ciphers.
  - **Manual Frequency Matcher**: Interactive drag/drop letter matching interface against standard English unigram distributions.

---

### 📊 3. Live Letter Frequency & Visual Analytics
- Real-time comparison chart (powered by Chart.js) comparing ciphertext letter distributions against standard English letter frequencies (ETAOIN SHRDLU).
- Interactive Chi-squared breakdown graphs per shift key.
- IoC period peak plots for Vigenère key length estimation.
- Simulated Annealing fitness curve log progression.

---

### 📚 4. Cryptographic Concept Hub
- In-depth interactive study guide explaining the theoretical mathematics behind classical encryption, frequency analysis, Chi-squared testing, Index of Coincidence, and Simulated Annealing heuristic search algorithms.

---

## 🛠️ Technology Stack

- **Frontend Core**: Modern JavaScript (ES Modules), HTML5, Web Workers
- **Styling**: Modern Dark Glassmorphism CSS Design System with CSS Variables, Flexbox, and Grid
- **Charts & Visualizations**: Chart.js v4
- **Icons**: Lucide Icons
- **Build System / Bundler**: Vite v8

---

## 🚀 Quick Start Guide

Follow these steps to set up and run the project on your local machine.

### Prerequisites
Make sure you have **Node.js** (v18.0.0 or higher) and **npm** installed on your system.

```bash
node -v
npm -v
```

---

### 1. Clone the Repository

```bash
git clone https://github.com/Aditya234-TCET/Smart-Cryptanalysis.git
cd Smart-Cryptanalysis
```

---

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

---

### 3. Run the Local Development Server

Start the Vite local development server:

```bash
npm run dev
```

After running the command, open your browser and navigate to:
```text
http://localhost:5173/
```

---

### 4. Build for Production

To create an optimized production build:

```bash
npm run build
```

To preview the built app locally:

```bash
npm run preview
```

---

## 📁 Project Structure

```text
Smart-Cryptanalysis/
├── index.html            # Main HTML application layout & UI structure
├── package.json          # Project metadata, scripts, and dependencies
├── vite.config.js        # Vite bundler configuration
├── src/
│   ├── main.js           # Main application logic & DOM event listeners
│   ├── ciphers.js        # Encryption & decryption implementations
│   ├── cryptanalysis.js  # Statistical metrics (IoC, Entropy, Chi-Square) & solvers
│   ├── worker.js         # Web Worker for background Simulated Annealing AI solving
│   ├── charts.js         # Chart.js initialization & dynamic chart updates
│   ├── bigrams.js        # English bigram log-frequency matrix dataset
│   ├── style.css         # Glassmorphism dark mode CSS design system
│   └── assets/           # Application icons and static assets
└── README.md             # Project documentation
```

---

## 💡 How to Use

1. **Test Encryption/Decryption**:
   - Go to the **Cipher Sandbox** tab.
   - Choose a cipher (e.g., *Caesar* or *Vigenère*).
   - Enter your plaintext, adjust the key parameters, and click **Execute Cipher Engine**.
   - Observe the live spatial visualization (e.g. Caesar Wheel rotation or Vigenère matrix).

2. **Crack an Unknown Ciphertext**:
   - Copy your ciphertext and switch to the **Cryptanalysis Suite** tab.
   - Click **Analyze Text** to inspect Index of Coincidence, Entropy, and predicted cipher type.
   - Select an automated solver and click **Start Solving** to watch the algorithmic cracking process in real time.

---

## 🌐 Deployment on Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. Log in to your [Vercel Account](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your GitHub repository: `Aditya234-TCET/Smart-Cryptanalysis`.
4. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Vercel will build and deploy your app with a free HTTPS URL (e.g. `smart-cryptanalysis.vercel.app`).

### Method 2: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Deploy to preview
vercel

# 3. Deploy to production
vercel --prod
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

