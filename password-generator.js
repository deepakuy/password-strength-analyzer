// Character sets for password generation
// Character sets for password generation
const CHARSETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    special: '!@#$%^&*()-_=+[]{}|;:,.<>?/`~'
};

// Common words for passphrase generation
const COMMON_WORDS = [
    'apple', 'banana', 'carrot', 'dolphin', 'elephant', 'flamingo', 'giraffe', 'hamburger',
    'icecream', 'jellyfish', 'koala', 'lemon', 'mango', 'narwhal', 'octopus', 'penguin',
    'quokka', 'raccoon', 'strawberry', 'tiger', 'umbrella', 'violet', 'watermelon', 'xylophone',
    'yellow', 'zebra', 'astronaut', 'butterfly', 'caterpillar', 'dragonfly', 'elephant', 'firefly'
];

/**
 * Generate a random password based on options
 * @param {Object} options - Password generation options
 * @param {number} options.length - Length of the password
 * @param {boolean} options.uppercase - Include uppercase letters
 * @param {boolean} options.lowercase - Include lowercase letters
 * @param {boolean} options.numbers - Include numbers
 * @param {boolean} options.special - Include special characters
 * @returns {string} Generated password
 */
function generatePassword(options) {
    const { length = 16, uppercase = true, lowercase = true, numbers = true, special = true } = options;
    
    // Build character set based on options
    let charset = '';
    if (lowercase) charset += CHARSETS.lowercase;
    if (uppercase) charset += CHARSETS.uppercase;
    if (numbers) charset += CHARSETS.numbers;
    if (special) charset += CHARSETS.special;
    
    // Ensure at least one character set is selected
    if (!charset) {
        charset = CHARSETS.lowercase + CHARSETS.uppercase + CHARSETS.numbers + CHARSETS.special;
    }
    
    // Generate password
    let password = '';
    const crypto = window.crypto || window.msCrypto;
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    
    for (let i = 0; i < length; i++) {
        const randomIndex = values[i] % charset.length;
        password += charset[randomIndex];
    }
    
    return password;
}

/**
 * Generate a memorable passphrase
 * @param {Object} options - Passphrase generation options
 * @param {number} options.wordCount - Number of words in the passphrase
 * @param {boolean} options.camelCase - Use camelCase formatting
 * @param {boolean} options.addNumbers - Add numbers to the passphrase
 * @returns {string} Generated passphrase
 */
function generatePassphrase(options) {
    const { wordCount = 4, camelCase = false, addNumbers = true } = options;
    const crypto = window.crypto || window.msCrypto;
    const values = new Uint32Array(wordCount);
    crypto.getRandomValues(values);
    
    // Generate passphrase words
    let words = [];
    for (let i = 0; i < wordCount; i++) {
        const randomIndex = values[i] % COMMON_WORDS.length;
        words.push(COMMON_WORDS[randomIndex]);
    }
    
    // Apply formatting
    let passphrase = '';
    if (camelCase) {
        passphrase = words.map((word, index) => 
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');
    } else {
        passphrase = words.join('-');
    }
    
    // Add numbers if requested
    if (addNumbers) {
        const number = Math.floor(Math.random() * 90) + 10; // 10-99
        passphrase += number;
    }
    
    return passphrase;
}

/**
 * Generate a password based on a pattern
 * @param {string} pattern - Pattern to use for generation
 * @returns {string} Generated password
 */
function generatePatternPassword(pattern) {
    const patterns = {
        'word-number-symbol': () => {
            const adjectives = ['Happy', 'Purple', 'Silly', 'Brave', 'Clever'];
            const nouns = ['Hippo', 'Dragon', 'Wizard', 'Panda', 'Ninja'];
            const symbols = ['!', '@', '#', '$', '%', '^', '&', '*'];
            
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            const year = new Date().getFullYear();
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            
            return `${adj}${noun}${year}${symbol}`;
        },
        'phrase-init': () => {
            const phrases = [
                'I want to be at New York 2025',
                'My dog is the best friend ever',
                'The quick brown fox jumps',
                'To be or not to be',
                'All your base are belong to us'
            ];
            
            const phrase = phrases[Math.floor(Math.random() * phrases.length)];
            return phrase.split(' ')
                .map(word => word.charAt(0))
                .join('') + (Math.floor(Math.random() * 90) + 10);
        },
        'keyboard-pattern': () => {
            const patterns = [
                '1qaz@WSX#EDC',
                'zaq1@WSX',
                '!QAZ2wsx#EDC',
                '1q2w3e4r5t',
                'qwerty!@#'
            ];
            return patterns[Math.floor(Math.random() * patterns.length)];
        }
    };
    
    return patterns[pattern] ? patterns[pattern]() : generatePassword({ length: 12 });
}

/**
 * Get password strength feedback
 * @param {string} password - Password to analyze
 * @returns {Object} Feedback object with score and suggestions
 */
function getPasswordFeedback(password) {
    const suggestions = [];
    const composition = {
        lowercase: (password.match(/[a-z]/g) || []).length,
        uppercase: (password.match(/[A-Z]/g) || []).length,
        numbers: (password.match(/[0-9]/g) || []).length,
        special: (password.match(/[^A-Za-z0-9]/g) || []).length,
        length: password.length
    };
    
    let score = 0;
    
    // Length check
    if (composition.length < 8) {
        suggestions.push('Use at least 8 characters');
    } else if (composition.length >= 12) {
        score++;
    }
    
    // Character variety
    const charTypes = [
        composition.lowercase > 0,
        composition.uppercase > 0,
        composition.numbers > 0,
        composition.special > 0
    ].filter(Boolean).length;
    
    if (charTypes >= 3) score++;
    if (charTypes >= 4) score++;
    
    // Common patterns to avoid
    const commonPatterns = [
        /(.)\1{2,}/, // Repeated characters
        /(123|abc|qwe|asd|zxc)/i, // Common sequences
        /(password|admin|welcome|qwerty|letmein)/i // Common words
    ];
    
    if (commonPatterns.some(pattern => pattern.test(password))) {
        suggestions.push('Avoid common patterns and words');
    } else {
        score++;
    }
    
    // Entropy check
    const entropy = calculateEntropy(password, composition);
    if (entropy.bits < 60) {
        suggestions.push('Consider increasing password complexity');
    } else {
        score++;
    }
    
    return { score: Math.min(score, 4), suggestions };
}

/**
 * Calculate password entropy
 * @param {string} password - Password to analyze
 * @param {Object} composition - Password composition
 * @returns {Object} Entropy information
 */
function calculateEntropy(password, composition) {
    let charSet = new Set();
    if (composition.lowercase) CHARSETS.lowercase.split('').forEach(c => charSet.add(c));
    if (composition.uppercase) CHARSETS.uppercase.split('').forEach(c => charSet.add(c));
    if (composition.numbers) CHARSETS.numbers.split('').forEach(c => charSet.add(c));
    if (composition.special) CHARSETS.special.split('').forEach(c => charSet.add(c));
    
    const charsetSize = Math.max(charSet.size, 1);
    const entropy = password.length * Math.log2(charsetSize);
    
    return { bits: Math.round(entropy * 10) / 10, charsetSize };
}

export { generatePassword, generatePassphrase, generatePatternPassword, getPasswordFeedback };
