document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const passwordInput = document.getElementById('passwordInput');
    const toggleButton = document.getElementById('toggleVisibility');
    const strengthText = document.getElementById('strengthText');
    const crackTimeElement = document.getElementById('crackTime');
    const lengthValueElement = document.getElementById('lengthValue');
    const entropyValueElement = document.getElementById('entropyValue');
    const suggestionsList = document.getElementById('suggestionsList');
    const themeToggle = document.getElementById('themeToggle');
    
    // State
    let isPasswordVisible = false;
    let currentTheme = localStorage.getItem('theme') || 'light';
    
    // Initialize the app
    init();
    
    function init() {
        // Set initial theme
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
            const icon = themeToggle?.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
        
        // Event Listeners
        if (toggleButton) toggleButton.addEventListener('click', togglePasswordVisibility);
        if (passwordInput) passwordInput.addEventListener('input', analyzePassword);
        if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
        
        // Initial analysis
        analyzePassword();
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
        const body = document.body;
        const icon = themeToggle?.querySelector('i');
        if (!icon) return;
        
        if (currentTheme === 'light') {
            body.classList.add('dark-theme');
            icon.className = 'fas fa-sun';
            currentTheme = 'dark';
        } else {
            body.classList.remove('dark-theme');
            icon.className = 'fas fa-moon';
            currentTheme = 'light';
        }
        localStorage.setItem('theme', currentTheme);
    }
    
    function analyzePassword() {
        const password = passwordInput?.value || '';
        const length = password.length;
        
        // Update length display
        if (lengthValueElement) lengthValueElement.textContent = length;
        
        if (length === 0) {
            resetUI();
            return;
        }
        
        // Calculate password metrics
        const composition = analyzeComposition(password);
        const entropyInfo = calculateEntropy(password, composition);
        const zxcvbnResult = window.zxcvbn ? window.zxcvbn(password) : null;
        
        // Update UI
        updateCompositionBars(composition);
        updateEntropyDisplay(entropyInfo);
        updateStrengthMeter(
            zxcvbnResult?.score || 0, 
            entropyInfo.bits, 
            composition
        );
        
        if (zxcvbnResult) {
            updateCrackTime(zxcvbnResult);
            updateSuggestions(zxcvbnResult, composition);
        }
    }
    
    function analyzeComposition(password) {
        return {
            lowercase: (password.match(/[a-z]/g) || []).length,
            uppercase: (password.match(/[A-Z]/g) || []).length,
            numbers: (password.match(/[0-9]/g) || []).length,
            special: (password.match(/[^A-Za-z0-9]/g) || []).length,
            length: password.length
        };
    }
    
    function updateCompositionBars(composition) {
        if (!composition) return;
        
        const total = composition.length || 1;
        
        ['lowercase', 'uppercase', 'numbers', 'special'].forEach(type => {
            const count = composition[type] || 0;
            const percentage = Math.min(100, (count / total) * 100);
            const fillElement = document.querySelector(`.composition-bar[data-type="${type}"] .composition-fill`);
            
            if (fillElement) {
                fillElement.style.width = `${percentage}%`;
                
                // Update count display
                const countElement = fillElement.parentElement.querySelector('.composition-count');
                if (countElement) {
                    countElement.textContent = count;
                }
            }
        });
    }
    
    function calculateEntropy(password, composition) {
        if (!password) return { bits: 0, charsetSize: 0, length: 0 };
        
        let charsetSize = 0;
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        
        // Add character set sizes
        if (hasLower) charsetSize += 26;
        if (hasUpper) charsetSize += 26;
        if (hasNumbers) charsetSize += 10;
        if (hasSpecial) charsetSize += 32;
        
        // Calculate entropy
        const length = password.length;
        const bits = Math.round(length * Math.log2(charsetSize) * 10) / 10;
        
        return { bits, charsetSize, length };
    }
    
    function updateEntropyDisplay(entropyInfo) {
        if (!entropyValueElement || !entropyInfo) return;
        
        entropyValueElement.textContent = entropyInfo.bits ? entropyInfo.bits.toFixed(1) : '0.0';
        
        // Update entropy detail
        const existingDetail = document.querySelector('.entropy-formula') || document.createElement('span');
        existingDetail.className = 'entropy-formula';
        existingDetail.title = `Entropy = Length (${entropyInfo.length}) × log₂(Character Set Size: ${entropyInfo.charsetSize})`;
        existingDetail.textContent = `(${entropyInfo.length} × log₂${entropyInfo.charsetSize})`;
        
        if (!existingDetail.parentNode && entropyValueElement.parentNode) {
            entropyValueElement.parentNode.insertBefore(existingDetail, entropyValueElement.nextSibling);
        }
    }
    
    function updateStrengthMeter(score, entropy, composition) {
        if (!strengthText) return;
        
        const strengthSegments = document.querySelectorAll('.strength-segment');
        let strengthTextContent = '';
        let strengthIcon = '';
        let strengthClass = '';
        
        // Reset all segments
        strengthSegments?.forEach(segment => {
            if (segment?.style) {
                segment.style.opacity = '0.2';
                segment.style.animation = 'none';
            }
        });
        
        // Determine strength
        if (!composition || composition.length === 0) {
            strengthTextContent = 'Very Weak';
            strengthIcon = 'fa-exclamation-circle';
            strengthClass = 'very-weak';
        } else if (entropy < 28) {
            strengthSegments?.[0]?.style?.setProperty('opacity', '1');
            strengthTextContent = 'Very Weak';
            strengthIcon = 'fa-exclamation-circle';
            strengthClass = 'very-weak';
        } else if (entropy < 36) {
            strengthSegments?.[0]?.style?.setProperty('opacity', '1');
            strengthSegments?.[1]?.style?.setProperty('opacity', '1');
            strengthTextContent = 'Weak';
            strengthIcon = 'fa-exclamation-triangle';
            strengthClass = 'weak';
        } else if (entropy < 60) {
            strengthSegments?.[0]?.style?.setProperty('opacity', '1');
            strengthSegments?.[1]?.style?.setProperty('opacity', '1');
            strengthSegments?.[2]?.style?.setProperty('opacity', '1');
            strengthTextContent = 'Medium';
            strengthIcon = 'fa-check-circle';
            strengthClass = 'medium';
        } else if (entropy < 128) {
            strengthSegments?.forEach((seg, i) => {
                if (i < 4) seg?.style?.setProperty('opacity', '1');
            });
            strengthTextContent = 'Strong';
            strengthIcon = 'fa-shield-alt';
            strengthClass = 'strong';
        } else {
            strengthSegments?.forEach(seg => {
                seg?.style?.setProperty('opacity', '1');
                seg?.style?.setProperty('animation', 'pulse 2s infinite');
            });
            strengthTextContent = 'Excellent';
            strengthIcon = 'fa-award';
            strengthClass = 'excellent';
        }
        
        // Update strength text
        strengthText.innerHTML = `<i class="fas ${strengthIcon}"></i> <span>Password Strength: <strong class="${strengthClass}">${strengthTextContent}</strong></span>`;
    }
    
    function updateCrackTime(result) {
        if (!crackTimeElement || !result?.crack_times_seconds) return;
        
        const seconds = result.crack_times_seconds.offline_slow_hashing_1e4_per_second;
        let timeString;
        let timeClass = '';
        
        if (seconds < 1) {
            timeString = 'Instant';
            timeClass = 'instant';
        } else if (seconds < 60) {
            timeString = `${Math.ceil(seconds)} seconds`;
            timeClass = 'very-fast';
        } else if (seconds < 3600) {
            const minutes = Math.ceil(seconds / 60);
            timeString = `${minutes} minute${minutes > 1 ? 's' : ''}`;
            timeClass = 'fast';
        } else if (seconds < 86400) {
            const hours = Math.ceil(seconds / 3600);
            timeString = `${hours} hour${hours > 1 ? 's' : ''}`;
            timeClass = 'medium';
        } else if (seconds < 2592000) {
            const days = Math.ceil(seconds / 86400);
            timeString = `${days} day${days > 1 ? 's' : ''}`;
            timeClass = 'slow';
        } else if (seconds < 31536000) {
            const months = Math.ceil(seconds / 2592000);
            timeString = `${months} month${months > 1 ? 's' : ''}`;
            timeClass = 'very-slow';
        } else {
            const years = Math.ceil(seconds / 31536000);
            timeString = years > 1000 ? 'Centuries' : `${years} year${years > 1 ? 's' : ''}`;
            timeClass = 'extremely-slow';
        }
        
        crackTimeElement.textContent = timeString;
        crackTimeElement.className = `stat-value ${timeClass}`;
    }
    
    function updateSuggestions(result, composition) {
        if (!suggestionsList) return;
        
        const suggestions = [];
        
        // Add zxcvbn suggestions
        if (result?.feedback) {
            if (result.feedback.warning) {
                suggestions.push(result.feedback.warning);
            }
            if (result.feedback.suggestions?.length > 0) {
                suggestions.push(...result.feedback.suggestions);
            }
        }
        
        // Add composition-based suggestions
        if (composition) {
            if (composition.length < 12) {
                suggestions.push('Use at least 12 characters');
            }
            if (composition.lowercase === 0) {
                suggestions.push('Add lowercase letters (a-z)');
            }
            if (composition.uppercase === 0) {
                suggestions.push('Add uppercase letters (A-Z)');
            }
            if (composition.numbers === 0) {
                suggestions.push('Add numbers (0-9)');
            }
            if (composition.special === 0) {
                suggestions.push('Add special characters (!@#$%^&*)');
            }
        }
        
        // Update the suggestions list
        if (suggestions.length === 0) {
            suggestionsList.innerHTML = '<li>Great job! Your password is strong.</li>';
        } else {
            suggestionsList.innerHTML = suggestions
                .map(s => `<li><i class="fas fa-info-circle"></i> ${s}</li>`)
                .join('');
        }
    }
    
    function resetUI() {
        // Reset strength meter
        document.querySelectorAll('.strength-segment')?.forEach(segment => {
            segment.style.opacity = '0.2';
            segment.style.animation = 'none';
        });
        
        if (strengthText) {
            strengthText.innerHTML = '<i class="fas fa-info-circle"></i> <span>Enter a password to check its strength</span>';
        }
        
        // Reset stats
        if (lengthValueElement) lengthValueElement.textContent = '0';
        if (crackTimeElement) {
            crackTimeElement.textContent = 'Instant';
            crackTimeElement.className = 'stat-value';
        }
        
        // Reset entropy
        if (entropyValueElement) entropyValueElement.textContent = '0';
        document.querySelector('.entropy-formula')?.remove();
        
        // Reset composition bars
        document.querySelectorAll('.composition-fill')?.forEach(fill => {
            fill.style.width = '0%';
            const countElement = fill.parentElement.querySelector('.composition-count');
            if (countElement) countElement.textContent = '0';
        });
        
        // Reset suggestions
        if (suggestionsList) {
            suggestionsList.innerHTML = '<li>Enter a password to get suggestions</li>';
        }
    }
});