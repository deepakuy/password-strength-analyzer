// Top 100 most common passwords (truncated for brevity)
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

/**
 * Check if password is in the list of common passwords
 * @param {string} password - The password to check
 * @returns {boolean} - True if password is common
 */
function isCommonPassword(password) {
    return COMMON_PASSWORDS.includes(password.toLowerCase());
}

/**
 * Check if password contains personal information
 * @param {string} password - The password to check
 * @param {Object} userInfo - User's personal information
 * @returns {Array} - Array of detected personal info in password
 */
function containsPersonalInfo(password, userInfo) {
    const warnings = [];
    const lowerPass = password.toLowerCase();
    
    // Check for names
    if (userInfo.firstName && lowerPass.includes(userInfo.firstName.toLowerCase())) {
        warnings.push('Contains first name');
    }
    if (userInfo.lastName && lowerPass.includes(userInfo.lastName.toLowerCase())) {
        warnings.push('Contains last name');
    }
    
    // Check username/email
    if (userInfo.username) {
        const username = userInfo.username.split('@')[0]; // Remove domain from email
        if (username && username.length > 2 && lowerPass.includes(username.toLowerCase())) {
            warnings.push('Contains username/email');
        }
    }
    
    // Check birth date (simple check for now)
    if (userInfo.birthDate) {
        const datePatterns = [
            userInfo.birthDate.replace(/[^0-9]/g, ''), // Remove non-digits
            userInfo.birthDate.split('-').reverse().join(''), // Reverse date format
            userInfo.birthDate.split('-').join('') // Just numbers
        ];
        
        if (datePatterns.some(pattern => 
            pattern && pattern.length >= 4 && lowerPass.includes(pattern)
        )) {
            warnings.push('Contains birth date');
        }
    }
    
    // Check phone number (digits only)
    if (userInfo.phoneNumber) {
        const phoneDigits = userInfo.phoneNumber.replace(/[^0-9]/g, '');
        if (phoneDigits.length >= 4 && lowerPass.includes(phoneDigits)) {
            warnings.push('Contains phone number');
        }
    }
    
    return warnings;
}

/**
 * Check if password has been exposed in data breaches using HaveIBeenPwned API
 * @param {string} password - The password to check
 * @returns {Promise<number>} - Number of times the password has been exposed
 */
async function checkPwnedPassword(password) {
    try {
        // Create SHA-1 hash of the password
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        
        // First 5 chars of hash is sent to the API
        const hashPrefix = hashHex.substring(0, 5);
        const hashSuffix = hashHex.substring(5);
        
        const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`, {
            headers: {
                'Add-Padding': 'true' // Add padding to prevent timing attacks
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to check password');
        }
        
        const data = await response.text();
        const results = data.split('\r\n');
        
        // Check if our hash suffix is in the results
        for (const line of results) {
            const [suffix, count] = line.split(':');
            if (suffix === hashSuffix) {
                return parseInt(count, 10);
            }
        }
        
        return 0; // Not found in breaches
    } catch (error) {
        console.error('Error checking pwned passwords:', error);
        return -1; // Error occurred
    }
}

export { isCommonPassword, containsPersonalInfo, checkPwnedPassword };
