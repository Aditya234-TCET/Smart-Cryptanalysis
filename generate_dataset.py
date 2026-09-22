import pandas as pd
import random
import math
import urllib.request
import string
import re

# 1. Fetch a simple dictionary/corpus
crypto_terms = ['CRYPTOGRAPHY', 'PRACTICE', 'TECHNIQUES', 'SECURE', 'COMMUNICATION', 'PRESENCE', 'ADVERSARIAL', 'BEHAVIOR', 'GENERALLY', 'CONSTRUCTING', 'ANALYZING', 'PROTOCOLS', 'PREVENT', 'THIRD', 'PARTIES', 'PUBLIC', 'PRIVATE', 'MESSAGES', 'CIPHER', 'ENCRYPT', 'DECRYPT', 'PLAINTEXT', 'CIPHERTEXT', 'ALGORITHM', 'VIGENERE', 'CAESAR', 'RAILFENCE', 'PLAYFAIR', 'SUBSTITUTION', 'TRANSPOSITION', 'KEY', 'CRYPTANALYSIS', 'MACHINE', 'LEARNING', 'PREDICTION', 'ACCURACY', 'FEATURE', 'EXTRACTION']

url = "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt"
try:
    response = urllib.request.urlopen(url)
    words = response.read().decode('utf-8').splitlines()
    words = [w.upper() for w in words if len(w) > 2] + crypto_terms
except:
    words = crypto_terms + ["ENCRYPTION", "CRYPTOLOGY", "SECURITY", "MESSAGE", "ALGORITHM", "NETWORK", "PASSWORD", "HELLO", "WORLD"]

def get_random_plaintext(length=20, keep_spaces=False):
    text = ""
    while len(text.replace(" ", "")) < length:
        text += random.choice(words) + " "
    
    text = text.strip()
    if not keep_spaces:
        text = text.replace(" ", "")
        
    # truncate without cutting words in half if possible, or just truncate
    return text[:length if not keep_spaces else int(length*1.2)]

# 2. Define Ciphers
def caesar_cipher(text, shift):
    res = ""
    for c in text:
        if c.isalpha():
            res += chr((ord(c) - 65 + shift) % 26 + 65)
        else:
            res += c
    return res

def vigenere_cipher(text, key):
    res = ""
    k_idx = 0
    for c in text:
        if c.isalpha():
            shift = ord(key[k_idx % len(key)]) - 65
            res += chr((ord(c) - 65 + shift) % 26 + 65)
            k_idx += 1
        else:
            res += c
    return res

def rail_fence_cipher(text, key):
    fence = [[] for _ in range(key)]
    rail = 0
    direction = 1
    for c in text:
        fence[rail].append(c)
        rail += direction
        if rail == key - 1 or rail == 0:
            direction = -direction
    res = ""
    for r in fence:
        res += "".join(r)
    return res

def monoalphabetic_cipher(text, key_map):
    res = ""
    for c in text:
        if c.isalpha():
            res += key_map[c]
        else:
            res += c
    return res

def playfair_cipher(text, key_matrix):
    # Simplified mock for playfair (to keep it fast, we do a basic substitution for dataset purposes)
    # True playfair requires pairing, but for a synthetic dataset of features, we just need something that disrupts freq.
    # To be accurate, we'll implement a basic playfair.
    return text # Fallback for now to avoid complexity, or better, implement basic pairing
    pass

# We will just use monoalphabetic for playfair in the dummy script if real playfair is too long, but let's do a simple real one.
def generate_playfair_matrix(key):
    alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"
    matrix = []
    used = set()
    for char in key + alphabet:
        if char == 'J': char = 'I'
        if char not in used:
            used.add(char)
            matrix.append(char)
    return [matrix[i:i+5] for i in range(0, 25, 5)]

def playfair_encrypt(text, key):
    matrix = generate_playfair_matrix(key)
    pos = {}
    for r in range(5):
        for c in range(5):
            pos[matrix[r][c]] = (r, c)
            
    text = text.replace('J', 'I')
    pairs = []
    i = 0
    while i < len(text):
        a = text[i]
        b = text[i+1] if i+1 < len(text) else 'X'
        if a == b:
            pairs.append((a, 'X'))
            i += 1
        else:
            pairs.append((a, b))
            i += 2
            
    res = ""
    for a, b in pairs:
        r1, c1 = pos[a]
        r2, c2 = pos[b]
        if r1 == r2:
            res += matrix[r1][(c1+1)%5] + matrix[r2][(c2+1)%5]
        elif c1 == c2:
            res += matrix[(r1+1)%5][c1] + matrix[(r2+1)%5][c2]
        else:
            res += matrix[r1][c2] + matrix[r2][c1]
    return res

# 3. Define Features
def calc_ioc(text):
    n = len(text)
    if n <= 1: return 0
    freqs = {chr(i): text.count(chr(i)) for i in range(65, 91)}
    ioc = sum([f * (f - 1) for f in freqs.values()]) / (n * (n - 1))
    return round(ioc, 4)

def calc_entropy(text):
    n = len(text)
    if n == 0: return 0
    freqs = {chr(i): text.count(chr(i)) for i in range(65, 91)}
    ent = 0
    for f in freqs.values():
        if f > 0:
            p = f / n
            ent -= p * math.log2(p)
    return round(ent, 4)

def calc_chisquare(text):
    english_freqs = {
        'A': 0.08167, 'B': 0.01492, 'C': 0.02782, 'D': 0.04253, 'E': 0.12702,
        'F': 0.02228, 'G': 0.02015, 'H': 0.06094, 'I': 0.06966, 'J': 0.000153,
        'K': 0.00772, 'L': 0.04025, 'M': 0.02406, 'N': 0.06749, 'O': 0.07507,
        'P': 0.01929, 'Q': 0.00095, 'R': 0.05987, 'S': 0.06327, 'T': 0.09056,
        'U': 0.02758, 'V': 0.00978, 'W': 0.02360, 'X': 0.00150, 'Y': 0.01974, 'Z': 0.00074
    }
    n = len(text)
    chi2 = 0
    for char in string.ascii_uppercase:
        obs = text.count(char)
        exp = english_freqs[char] * n
        if exp > 0:
            chi2 += ((obs - exp) ** 2) / exp
    return round(chi2, 4)

def calc_bigram_score(text):
    # simple proxy: just count number of common english bigrams
    common_bigrams = ['TH', 'HE', 'IN', 'ER', 'AN', 'RE', 'ND', 'AT', 'ON', 'NT', 'HA', 'ES', 'ST']
    score = 0
    for bg in common_bigrams:
        score += text.count(bg)
    return score

def calc_dict_match(text):
    # Actual dictionary match logic mirroring JS frontend
    tokens = text.split()
    if not tokens: return 0
    matches = sum(1 for w in tokens if w.upper() in words)
    return int((matches / len(tokens)) * 100)

def calc_repeated(text):
    # Simple count of repeating trigrams
    trigrams = [text[i:i+3] for i in range(len(text)-2)]
    repeats = len(trigrams) - len(set(trigrams))
    return repeats

# Generate Data
data = []
for i in range(1000): # 1000 rows
    label = random.choice(['Caesar', 'Vigenere', 'PlainEnglish', 'RailFence', 'Monoalphabetic', 'Playfair'])
    pt_len = random.randint(10, 100)
    if label == 'PlainEnglish':
        pt = get_random_plaintext(pt_len, keep_spaces=True)
    else:
        pt = get_random_plaintext(pt_len, keep_spaces=False)
        
    ct = pt
    key_str = ""
    
    if label == 'Caesar':
        shift = random.randint(1, 25)
        key_str = str(shift)
        ct = caesar_cipher(pt, shift)
    elif label == 'Vigenere':
        key_str = get_random_plaintext(random.randint(3, 8))
        ct = vigenere_cipher(pt, key_str)
    elif label == 'RailFence':
        rails = random.randint(2, 6)
        key_str = str(rails)
        ct = rail_fence_cipher(pt, rails)
    elif label == 'Monoalphabetic':
        alphabet = list(string.ascii_uppercase)
        shuffled = alphabet.copy()
        random.shuffle(shuffled)
        key_map = dict(zip(alphabet, shuffled))
        key_str = "".join(shuffled)
        ct = monoalphabetic_cipher(pt, key_map)
    elif label == 'Playfair':
        key_str = get_random_plaintext(random.randint(5, 10)).replace("J", "I")
        ct = playfair_encrypt(pt, key_str)
    elif label == 'PlainEnglish':
        key_str = ""
        ct = pt
        
    dict_match = calc_dict_match(ct)
    if label == 'Caesar' and key_str == '0':
        dict_match = calc_dict_match(ct)
        
    data.append({
        'Plaintext': pt,
        'Ciphertext': ct,
        'CipherType': label if label != 'PlainEnglish' else 'None',
        'CipherKey': key_str,
        'IOC': calc_ioc(ct),
        'Entropy': calc_entropy(ct),
        'ChiSquare': calc_chisquare(ct),
        'BigramScore': calc_bigram_score(ct), # Simple heuristic
        'DictionaryMatch(%)': dict_match,
        'RepeatedPatternScore': calc_repeated(ct),
        'CipherLength': len(ct),
        'Label': label
    })

df = pd.DataFrame(data)
df.to_excel('Smart_Cryptanalysis_ML_Training_Dataset.xlsx', index=False)
print(f"Generated dataset with {len(df)} rows.")
