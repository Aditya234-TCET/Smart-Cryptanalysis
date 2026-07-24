// English Bigram Log-Frequencies and Vocabulary for Cryptanalysis Scoring

// Standard English letter frequencies (A-Z)
export const ENGLISH_FREQS = {
  A: 0.08167, B: 0.01492, C: 0.02782, D: 0.04253, E: 0.12702,
  F: 0.02228, G: 0.02015, H: 0.06094, I: 0.06966, J: 0.00153,
  K: 0.00772, L: 0.04025, M: 0.02406, N: 0.06749, O: 0.07507,
  P: 0.01929, Q: 0.00095, R: 0.05987, S: 0.06327, T: 0.09056,
  U: 0.02758, V: 0.00978, W: 0.02360, X: 0.00150, Y: 0.01974,
  Z: 0.00074
};

// 200 Most common English words for dictionary checks
export const COMMON_WORDS = new Set([
  "THE", "BE", "TO", "OF", "AND", "A", "IN", "THAT", "HAVE", "I", 
  "IT", "FOR", "NOT", "ON", "WITH", "HE", "AS", "YOU", "DO", "AT", 
  "THIS", "BUT", "HIS", "BY", "FROM", "THEY", "WE", "SAY", "HER", "SHE", 
  "OR", "AN", "WILL", "MY", "ONE", "ALL", "WOULD", "THERE", "THEIR", "WHAT", 
  "SO", "UP", "OUT", "IF", "ABOUT", "WHO", "GET", "WHICH", "GO", "ME", 
  "WHEN", "MAKE", "CAN", "LIKE", "TIME", "NO", "JUST", "HIM", "KNOW", "TAKE", 
  "PEOPLE", "INTO", "YEAR", "YOUR", "GOOD", "SOME", "COULD", "THEM", "SEE", "OTHER", 
  "THAN", "THEN", "NOW", "LOOK", "ONLY", "COME", "ITS", "OVER", "THINK", "ALSO", 
  "BACK", "AFTER", "USE", "TWO", "HOW", "OUR", "WORK", "FIRST", "WELL", "WAY", 
  "EVEN", "NEW", "WANT", "BECAUSE", "ANY", "THESE", "GIVE", "DAY", "MOST", "US", 
  "HERE", "SUCH", "MANY", "UNDER", "YEARS", "GREAT", "SAME", "HIMSELF", "LOOKED", "FIND", 
  "WHERE", "THROUGH", "BEFORE", "GO", "MORE", "ABOUT", "LITTLE", "SHOULD", "THOSE", "DID", 
  "OWN", "THINGS", "MAY", "MADE", "ABOUT", "RIGHT", "STATE", "ONLY", "BEEN", "WORDS", 
  "LONG", "MIGHT", "THREE", "PART", "OVER", "WORLD", "LIFE", "EACH", "NEVER", "ABOUT", 
  "THROUGH", "HOUSE", "BOTH", "BETWEEN", "COULD", "UNDER", "WHILE", "LAST", "MIGHT", "GREAT", 
  "FAMILY", "OWN", "OUT", "INTO", "SINCE", "STILL", "SYSTEM", "DURING", "SCHOOL", "NEXT", 
  "SMALL", "NUMBER", "OFF", "ALWAYS", "SAY", "SHOW", "OFFICE", "POINT", "YET", "AGAIN", 
  "BEFORE", "AGAINST", "TODAY", "AWAY", "AROUND", "UNDER", "NIGHT", "FACT", "HOME", "WATER"
]);

// Log probabilities of common English bigrams (relative values)
// Based on Google Books Ngram corpus, normalized for fast sum scoring.
// Missing bigrams will receive a default penalty of -7.0
export const BIGRAM_LOGS = {
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
export const DEFAULT_PENALTY = -7.0;

// Fitness evaluation function using bigram log probabilities
export function getFitness(text) {
  let score = 0;
  let count = 0;
  const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '');
  
  for (let i = 0; i < cleaned.length - 1; i++) {
    const bigram = cleaned.substring(i, i + 2);
    const logVal = BIGRAM_LOGS[bigram] !== undefined ? BIGRAM_LOGS[bigram] : DEFAULT_PENALTY;
    score += logVal;
    count++;
  }
  
  // Return normalized score per character to make it text-length invariant
  return count > 0 ? score / count : -10.0;
}

// Dictionary matching ratio (fraction of words matching common dictionary)
export function getDictionaryScore(text) {
  const words = text.toUpperCase().replace(/[^A-Z\s]/g, '').split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return 0;
  
  let matches = 0;
  for (const word of words) {
    if (COMMON_WORDS.has(word)) {
      matches++;
    }
  }
  return matches / words.length;
}
