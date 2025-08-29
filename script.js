// Make zxcvbn available globally
const zxcvbn = window.zxcvbn || {};

// DOM Elements
let passwordInput, toggleButton, suggestButton, strengthText, crackTimeElement, 
    lengthValueElement, entropyValueElement, suggestionsList, themeToggle, suggestionPanel;
let isPasswordVisible = false;
let currentTheme = localStorage.getItem('theme') || 'light';

// Chart instances
let compositionChart, strengthRadarChart, crackTimeChart;

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

// Top 100 most common passwords
const COMMON_PASSWORDS = [
    '123456', 'password', '123456789', '12345', '12345678',
    'qwerty', '1234567', '111111', '1234567890', '123123',
    'abc123', '1234', 'password1', 'iloveyou', '1q2w3e4r',
    '000000', 'qwerty123', 'zaq12wsx', 'dragon', 'sunshine',
    'princess', 'letmein', 'welcome', '666666', 'abc123',
    'football', '1233', 'monkey', '654321', '!@#$%^&*',
    'charlie', 'aa123456', 'donald', 'password1', 'qwerty123',
    'qazwsx', 'trustno1', 'jordan23', 'killer', 'welcome1',
    'jennifer', 'superman', 'hunter', 'freedom', 'andrew',
    'tigger', 'soccer', 'basketball', 'iloveyou1', '123qwe'
];

// Utility functions
function calculateEntropy(password) {
    let charSet = 0;
    if (/[a-z]/.test(password)) charSet += 26;
    if (/[A-Z]/.test(password)) charSet += 26;
    if (/\d/.test(password)) charSet += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charSet += 32;
    
    return password.length * Math.log2(charSet || 1);
}

function updateCrackTime(entropy) {
    if (!crackTimeElement) return;
    
    const seconds = Math.pow(2, entropy) / 1000000000; // 1 billion hashes/sec
    let timeString;
    
    if (seconds < 1) timeString = 'less than a second';
    else if (seconds < 60) timeString = `${Math.round(seconds)} seconds`;
    else if (seconds < 3600) timeString = `${Math.round(seconds / 60)} minutes`;
    else if (seconds < 86400) timeString = `${Math.round(seconds / 3600)} hours`;
    else if (seconds < 2592000) timeString = `${Math.round(seconds / 86400)} days`;
    else if (seconds < 31536000) timeString = `${Math.round(seconds / 2592000)} months`;
    else timeString = `${Math.round(seconds / 31536000)} years`;
    
    crackTimeElement.textContent = timeString;
}

function updateStrengthMeter(entropy) {
    const strengthSegments = document.querySelectorAll('.strength-segment');
    const strengthLabels = document.querySelectorAll('.strength-labels span');
    
    // Reset all segments
    strengthSegments.forEach(segment => {
        segment.classList.remove('active');
    });
    
    // Determine strength level
    let strengthLevel = 'weak';
    if (entropy > 80) strengthLevel = 'excellent';
    else if (entropy > 60) strengthLevel = 'strong';
    else if (entropy > 40) strengthLevel = 'medium';
    
    // Activate appropriate segment
    const activeSegment = document.querySelector(`[data-strength="${strengthLevel}"]`);
    if (activeSegment) {
        activeSegment.classList.add('active');
    }
    
    // Update strength text
    if (strengthText) {
        const strengthTextSpan = strengthText.querySelector('span');
        if (strengthTextSpan) {
            strengthTextSpan.textContent = `Strength: ${strengthLevel.charAt(0).toUpperCase() + strengthLevel.slice(1)}`;
        }
    }
}

function updateCompositionBars(password) {
    const compositionBars = document.querySelectorAll('.composition-bar');
    
    compositionBars.forEach(bar => {
        const type = bar.dataset.type;
        const fill = bar.querySelector('.composition-fill');
        let count = 0;
        
        switch (type) {
            case 'lowercase':
                count = (password.match(/[a-z]/g) || []).length;
                break;
            case 'uppercase':
                count = (password.match(/[A-Z]/g) || []).length;
                break;
            case 'numbers':
                count = (password.match(/[0-9]/g) || []).length;
                break;
            case 'special':
                count = (password.match(/[^A-Za-z0-9]/g) || []).length;
                break;
        }
        
        const percentage = password.length > 0 ? (count / password.length) * 100 : 0;
        fill.style.width = `${percentage}%`;
        fill.style.opacity = percentage > 0 ? '1' : '0.3';
    });
}

function generateSuggestions(password) {
    const suggestions = [];
    
    if (password.length < 8) {
        suggestions.push('Use at least 8 characters');
    }
    
    if (!/[a-z]/.test(password)) {
        suggestions.push('Add lowercase letters (a-z)');
    }
    
    if (!/[A-Z]/.test(password)) {
        suggestions.push('Add uppercase letters (A-Z)');
    }
    
    if (!/\d/.test(password)) {
        suggestions.push('Add numbers (0-9)');
    }
    
    if (!/[^a-zA-Z0-9]/.test(password)) {
        suggestions.push('Add special characters (!@#$%^&*)');
    }
    
    if (password.length < 12) {
        suggestions.push('Consider using 12+ characters for better security');
    }
    
    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
        suggestions.push('Avoid repeated characters');
    }
    
    if (/(123|abc|qwe|asd|zxc)/i.test(password)) {
        suggestions.push('Avoid common keyboard patterns');
    }
    
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
        suggestions.push('This is a very common password - choose something unique');
    }
    
    return suggestions;
}

function updateSuggestions(password) {
    if (!suggestionsList) return;
    
    if (!password) {
        suggestionsList.innerHTML = '<li>Enter a password to get suggestions</li>';
        return;
    }
    
    const suggestions = generateSuggestions(password);
    
    if (suggestions.length === 0) {
        suggestionsList.innerHTML = '<li class="success">Great password! No suggestions needed.</li>';
    } else {
        suggestionsList.innerHTML = suggestions.map(suggestion => 
            `<li><i class="fas fa-exclamation-triangle"></i> ${suggestion}</li>`
        ).join('');
    }
}

function analyzePassword() {
    const password = passwordInput?.value || '';
    
    // Update length
    if (lengthValueElement) {
        lengthValueElement.textContent = password.length;
    }
    
    // Calculate and update entropy
    const entropy = calculateEntropy(password);
    if (entropyValueElement) {
        entropyValueElement.textContent = entropy.toFixed(1);
    }
    
    // Update crack time
    updateCrackTime(entropy);
    
    // Update strength meter
    updateStrengthMeter(entropy);
    
    // Update composition bars
    updateCompositionBars(password);
    
    // Update suggestions
    updateSuggestions(password);
    
    // Update charts and compliance checklist
    updateCharts(password);
    updateComplianceChecklist(password);
}

function togglePasswordVisibility() {
    if (!passwordInput || !toggleButton) return;
    
    isPasswordVisible = !isPasswordVisible;
    passwordInput.type = isPasswordVisible ? 'text' : 'password';
    
    // Update the eye icon
    const eyeIcon = toggleButton.querySelector('i');
    if (eyeIcon) {
        eyeIcon.className = isPasswordVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();
}

function applyTheme() {
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const icon = themeToggle?.querySelector('i');
        if (icon) icon.className = 'fas fa-sun';
    } else {
        document.body.classList.remove('dark-theme');
        const icon = themeToggle?.querySelector('i');
        if (icon) icon.className = 'fas fa-moon';
    }
    localStorage.setItem('theme', currentTheme);
    
    // Update chart colors for theme
    updateChartColors();
}

function updateChartColors() {
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
    
    // Update composition chart legend colors
    if (compositionChart) {
        compositionChart.options.plugins.legend.labels.color = textColor;
        compositionChart.update();
    }
    
    // Update strength radar chart colors
    if (strengthRadarChart) {
        strengthRadarChart.options.scales.r.ticks.color = textColor;
        strengthRadarChart.options.scales.r.grid.color = borderColor;
        strengthRadarChart.options.scales.r.pointLabels.color = textColor;
        strengthRadarChart.update();
    }
    
    // Update crack time chart colors
    if (crackTimeChart) {
        crackTimeChart.options.scales.y.ticks.color = textColor;
        crackTimeChart.options.scales.y.grid.color = borderColor;
        crackTimeChart.options.scales.x.ticks.color = textColor;
        crackTimeChart.options.scales.x.grid.color = borderColor;
        crackTimeChart.update();
    }
}

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

function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.style.display = 'none');
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show target content
            const targetContent = document.getElementById(targetTab + 'Tab');
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });
}

function setupPasswordGeneration() {
    const generateBtn = document.getElementById('generatePassword');
    const generatedPassword = document.getElementById('generatedPassword');
    const copyPassword = document.getElementById('copyPassword');
    
    if (generateBtn && generatedPassword) {
        generateBtn.addEventListener('click', () => {
            const options = {
                length: parseInt(document.getElementById('pwLength').value) || 16,
                uppercase: document.getElementById('useUppercase').checked,
                lowercase: document.getElementById('useLowercase').checked,
                numbers: document.getElementById('useNumbers').checked,
                special: document.getElementById('useSpecial').checked
            };
            
            const password = generatePassword(options);
            generatedPassword.value = password;
        });
    }
    
    if (copyPassword && generatedPassword) {
        copyPassword.addEventListener('click', () => {
            generatedPassword.select();
            document.execCommand('copy');
            copyPassword.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyPassword.innerHTML = '<i class="far fa-copy"></i>';
            }, 2000);
        });
    }
}

function setupPassphraseGeneration() {
    const generateBtn = document.getElementById('generatePassphrase');
    const generatedPassphrase = document.getElementById('generatedPassphrase');
    const copyPassphrase = document.getElementById('copyPassphrase');
    
    if (generateBtn && generatedPassphrase) {
        generateBtn.addEventListener('click', () => {
            const options = {
                wordCount: parseInt(document.getElementById('wordCount').value) || 4,
                camelCase: document.getElementById('useCamelCase').checked,
                addNumbers: document.getElementById('useNumbersInPhrase').checked
            };
            
            const passphrase = generatePassphrase(options);
            generatedPassphrase.value = passphrase;
        });
    }
    
    if (copyPassphrase && generatedPassphrase) {
        copyPassphrase.addEventListener('click', () => {
            generatedPassphrase.select();
            document.execCommand('copy');
            copyPassphrase.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyPassphrase.innerHTML = '<i class="far fa-copy"></i>';
            }, 2000);
        });
    }
}

function setupPatternGeneration() {
    const patternButtons = document.querySelectorAll('.pattern-btn');
    
    patternButtons.forEach(button => {
        button.addEventListener('click', () => {
            const pattern = button.dataset.pattern;
            let password = '';
            
            switch (pattern) {
                case 'word-number-symbol':
                    const adjectives = ['Happy', 'Purple', 'Silly', 'Brave', 'Clever'];
                    const nouns = ['Hippo', 'Dragon', 'Wizard', 'Panda', 'Ninja'];
                    const symbols = ['!', '@', '#', '$', '%', '^', '&', '*'];
                    
                    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
                    const noun = nouns[Math.floor(Math.random() * nouns.length)];
                    const year = new Date().getFullYear();
                    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
                    
                    password = `${adj}${noun}${year}${symbol}`;
                    break;
                    
                case 'phrase-init':
                    const phrases = [
                        'I want to be at New York 2025',
                        'My dog is the best friend ever',
                        'The quick brown fox jumps',
                        'To be or not to be',
                        'All your base are belong to us'
                    ];
                    
                    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
                    password = phrase.split(' ')
                        .map(word => word.charAt(0))
                        .join('') + (Math.floor(Math.random() * 90) + 10);
                    break;
                    
                case 'keyboard-pattern':
                    const patterns = [
                        '1qaz@WSX#EDC',
                        'zaq1@WSX',
                        '!QAZ2wsx#EDC',
                        '1q2w3e4r5t',
                        'qwerty!@#'
                    ];
                    password = patterns[Math.floor(Math.random() * patterns.length)];
                    break;
            }
            
            if (password) {
                passwordInput.value = password;
                analyzePassword();
            }
        });
    });
}

// Chart creation and management functions
function createCharts() {
    // Character Composition Pie Chart
    const compositionCtx = document.getElementById('compositionChart');
    if (compositionCtx) {
        compositionChart = new Chart(compositionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Lowercase', 'Uppercase', 'Numbers', 'Special'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#6f42c1', '#20c997', '#fd7e14', '#e83e8c'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }
    
    // Strength Score Radar Chart
    const strengthCtx = document.getElementById('strengthRadarChart');
    if (strengthCtx) {
        strengthRadarChart = new Chart(strengthCtx, {
            type: 'radar',
            data: {
                labels: ['Length', 'Complexity', 'Uniqueness', 'Entropy', 'Patterns'],
                datasets: [{
                    label: 'Current Score',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: { size: 10 }
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        },
                        pointLabels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: { size: 11 }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Crack Time Comparison Chart
    const crackTimeCtx = document.getElementById('crackTimeChart');
    if (crackTimeCtx) {
        crackTimeChart = new Chart(crackTimeCtx, {
            type: 'bar',
            data: {
                labels: ['Your Password', 'Weak (8 chars)', 'Strong (12 chars)', 'Excellent (16 chars)'],
                datasets: [{
                    label: 'Crack Time (seconds)',
                    data: [0, 0.001, 1, 1000000],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(220, 53, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(40, 167, 69, 0.8)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(40, 167, 69, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'logarithmic',
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: { size: 10 }
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: { size: 10 }
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

function updateCharts(password) {
    if (!password) {
        // Reset charts to empty state
        if (compositionChart) {
            compositionChart.data.datasets[0].data = [0, 0, 0, 0];
            compositionChart.update();
        }
        if (strengthRadarChart) {
            strengthRadarChart.data.datasets[0].data = [0, 0, 0, 0, 0];
            strengthRadarChart.update();
        }
        if (crackTimeChart) {
            crackTimeChart.data.datasets[0].data[0] = 0;
            crackTimeChart.update();
        }
        return;
    }
    
    // Update Composition Chart
    if (compositionChart) {
        const lowercase = (password.match(/[a-z]/g) || []).length;
        const uppercase = (password.match(/[A-Z]/g) || []).length;
        const numbers = (password.match(/[0-9]/g) || []).length;
        const special = (password.match(/[^A-Za-z0-9]/g) || []).length;
        
        compositionChart.data.datasets[0].data = [lowercase, uppercase, numbers, special];
        compositionChart.update();
    }
    
    // Update Strength Radar Chart
    if (strengthRadarChart) {
        const length = Math.min(100, (password.length / 16) * 100);
        const complexity = calculateComplexityScore(password);
        const uniqueness = calculateUniquenessScore(password);
        const entropy = Math.min(100, (calculateEntropy(password) / 80) * 100);
        const patterns = calculatePatternScore(password);
        
        strengthRadarChart.data.datasets[0].data = [length, complexity, uniqueness, entropy, patterns];
        strengthRadarChart.update();
    }
    
    // Update Crack Time Chart
    if (crackTimeChart) {
        const currentEntropy = calculateEntropy(password);
        const currentCrackTime = Math.pow(2, currentEntropy) / 1000000000;
        
        crackTimeChart.data.datasets[0].data[0] = Math.max(0.001, currentCrackTime);
        crackTimeChart.update();
    }
}

function calculateComplexityScore(password) {
    let score = 0;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[^a-zA-Z0-9]/.test(password)) score += 25;
    return score;
}

function calculateUniquenessScore(password) {
    const uniqueChars = new Set(password).size;
    return Math.min(100, (uniqueChars / password.length) * 100);
}

function calculatePatternScore(password) {
    let score = 100;
    
    // Deduct points for common patterns
    if (/(.)\1{2,}/.test(password)) score -= 20;
    if (/(123|abc|qwe|asd|zxc)/i.test(password)) score -= 30;
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) score -= 50;
    
    return Math.max(0, score);
}

function updateComplianceChecklist(password) {
    const checklist = document.getElementById('complianceChecklist');
    if (!checklist) return;
    
    const items = checklist.querySelectorAll('.compliance-item');
    
    if (!password) {
        items.forEach(item => {
            item.className = 'compliance-item';
            item.querySelector('i').className = 'fas fa-circle';
        });
        return;
    }
    
    const compliance = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[^a-zA-Z0-9]/.test(password),
        noPatterns: !/(.)\1{2,}/.test(password) && !/(123|abc|qwe|asd|zxc)/i.test(password),
        noPersonal: true, // This would need user input to check properly
        entropy: calculateEntropy(password) > 60
    };
    
    const complianceTexts = [
        'Minimum 8 characters',
        'Contains lowercase letters',
        'Contains uppercase letters',
        'Contains numbers',
        'Contains special characters',
        'No common patterns',
        'No personal information',
        'Entropy > 60 bits'
    ];
    
    items.forEach((item, index) => {
        const key = Object.keys(compliance)[index];
        const isCompliant = compliance[key];
        
        item.className = `compliance-item ${isCompliant ? 'compliant' : 'non-compliant'}`;
        const icon = item.querySelector('i');
        icon.className = isCompliant ? 'fas fa-check-circle' : 'fas fa-times-circle';
        
        // Add warning for some items
        if (key === 'length' && password.length >= 6 && password.length < 8) {
            item.className = 'compliance-item warning';
            icon.className = 'fas fa-exclamation-circle';
        }
    });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    passwordInput = document.getElementById('passwordInput');
    toggleButton = document.getElementById('toggleVisibility');
    suggestButton = document.getElementById('suggestPassword');
    strengthText = document.getElementById('strengthText');
    crackTimeElement = document.getElementById('crackTime');
    lengthValueElement = document.getElementById('lengthValue');
    entropyValueElement = document.getElementById('entropyValue');
    suggestionsList = document.getElementById('suggestionsList');
    themeToggle = document.getElementById('themeToggle');
    suggestionPanel = document.getElementById('suggestionPanel');

    // Set up event listeners
    if (passwordInput) passwordInput.addEventListener('input', analyzePassword);
    if (toggleButton) toggleButton.addEventListener('click', togglePasswordVisibility);
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    // Suggestion panel toggle
    if (suggestButton && suggestionPanel) {
        suggestButton.addEventListener('click', () => {
            suggestionPanel.style.display = 
                suggestionPanel.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    // Setup additional functionality
    setupTabSwitching();
    setupPasswordGeneration();
    setupPassphraseGeneration();
    setupPatternGeneration();
    
    // Create charts
    createCharts();
    
    // Apply saved theme
    applyTheme();
    
    // Initial analysis if there's a password
    if (passwordInput && passwordInput.value) {
        analyzePassword();
    }
});
