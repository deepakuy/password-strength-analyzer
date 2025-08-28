document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('passwordInput');
    const toggleButton = document.getElementById('toggleVisibility');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const requirementsList = document.querySelectorAll('.requirements li');

    let isPasswordVisible = false;

    // Toggle password visibility
    toggleButton.addEventListener('click', () => {
        isPasswordVisible = !isPasswordVisible;
        passwordInput.type = isPasswordVisible ? 'text' : 'password';
        toggleButton.textContent = isPasswordVisible ? '👁️' : '👁️';
    });

    // Check password strength
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = checkPasswordStrength(password);
        updateStrengthMeter(strength);
        updateRequirements(password);
    });

    function checkPasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 20;
        
        // Contains uppercase letters
        if (/[A-Z]/.test(password)) strength += 20;
        
        // Contains lowercase letters
        if (/[a-z]/.test(password)) strength += 20;
        
        // Contains numbers
        if (/[0-9]/.test(password)) strength += 20;
        
        // Contains special characters
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;
        
        return Math.min(strength, 100); // Cap at 100
    }

    function updateStrengthMeter(strength) {
        strengthBar.style.width = `${strength}%`;
        
        // Update color based on strength
        if (strength < 30) {
            strengthBar.style.backgroundColor = '#ff4757';
            strengthText.textContent = 'Password Strength: Very Weak';
            strengthText.style.color = '#ff4757';
        } else if (strength < 60) {
            strengthBar.style.backgroundColor = '#ffa502';
            strengthText.textContent = 'Password Strength: Weak';
            strengthText.style.color = '#ffa502';
        } else if (strength < 80) {
            strengthBar.style.backgroundColor = '#ffd32a';
            strengthText.textContent = 'Password Strength: Moderate';
            strengthText.style.color = '#ffd32a';
        } else if (strength < 100) {
            strengthBar.style.backgroundColor = '#1e90ff';
            strengthText.textContent = 'Password Strength: Strong';
            strengthText.style.color = '#1e90ff';
        } else {
            strengthBar.style.backgroundColor = '#2ed573';
            strengthText.textContent = 'Password Strength: Very Strong';
            strengthText.style.color = '#2ed573';
        }
    }

    function updateRequirements(password) {
        // Length requirement
        toggleRequirement('length', password.length >= 8);
        
        // Uppercase requirement
        toggleRequirement('uppercase', /[A-Z]/.test(password));
        
        // Lowercase requirement
        toggleRequirement('lowercase', /[a-z]/.test(password));
        
        // Number requirement
        toggleRequirement('number', /[0-9]/.test(password));
        
        // Special character requirement
        toggleRequirement('special', /[^A-Za-z0-9]/.test(password));
    }

    function toggleRequirement(requirement, isValid) {
        const element = document.querySelector(`[data-requirement="${requirement}"]`);
        if (isValid) {
            element.classList.add('valid');
        } else {
            element.classList.remove('valid');
        }
    }
});
