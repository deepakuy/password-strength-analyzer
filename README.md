# 🔒 Password Strength Analyzer

A comprehensive, real-time password strength analysis tool with visual analytics, security scoring, and professional reporting capabilities.

## 🌟 Features

### 🔐 Core Analysis
- **Real-time Password Analysis**: Instant feedback as you type
- **Entropy Calculation**: Mathematical strength measurement
- **Security Scoring**: 4-category scoring system (Length, Complexity, Uniqueness, Security)
- **Crack Time Estimation**: Time to brute-force attack calculation
- **Pattern Detection**: Identifies common vulnerabilities and patterns

### 📊 Visual Analytics
- **Character Composition Pie Chart**: Visual breakdown of character types
- **Strength Score Radar Chart**: Multi-dimensional strength visualization
- **Crack Time Comparison Graph**: Benchmark against different password strengths
- **Policy Compliance Checklist**: Real-time compliance status
- **Security Score Cards**: Shareable security assessments

### 🛠️ Advanced Tools
- **Password Generator**: Customizable random password generation
- **Passphrase Generator**: Memorable passphrase creation
- **Pattern Generator**: Structured password patterns
- **Personal Info Detection**: Identifies personal information in passwords

### 📋 Professional Features
- **PDF Report Generation**: Comprehensive security analysis reports
- **Export Options**: CSV, JSON, HTML export formats
- **Policy Templates**: Pre-built security policy templates
- **Shareable Score Cards**: Social media-ready security summaries

### ⚡ Performance Optimizations
- **Input Debouncing**: Smooth real-time analysis
- **Performance Monitoring**: Built-in performance tracking
- **Optimized Algorithms**: Fast analysis even for complex passwords
- **Memory Management**: Efficient resource usage

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required - runs entirely in the browser

### Installation

#### Option 1: Direct Download
```bash
# Clone the repository
git clone https://github.com/deepakuy/password-strength-analyzer.git

# Navigate to the directory
cd password-strength-analyzer

# Open in your browser
open index.html
```

#### Option 2: Local Server (Recommended)
```bash
# Navigate to the project directory
cd password-strength-analyzer

# Start a local server
python -m http.server 8000

# Open in your browser
open http://localhost:8000
```

#### Option 3: Using Node.js
```bash
# Install a simple HTTP server
npm install -g http-server

# Start the server
http-server

# Open in your browser
open http://localhost:8080
```

## 📖 Usage Guide

### Basic Password Analysis

1. **Open the Application**: Navigate to the password analyzer in your browser
2. **Enter a Password**: Type or paste a password in the input field
3. **View Results**: Real-time analysis updates automatically

```javascript
// Example: Analyze a password programmatically
const password = "MySecurePassword123!";
const entropy = calculateEntropy(password);
const scores = calculateSecurityScores(password);
console.log(`Entropy: ${entropy} bits`);
console.log(`Security Score: ${scores.total}/100`);
```

### Visual Analytics

The application provides comprehensive visual feedback:

- **Strength Meter**: Color-coded strength indicator
- **Character Composition**: Pie chart showing character distribution
- **Security Radar**: Multi-dimensional strength visualization
- **Compliance Checklist**: Real-time policy compliance status

### Password Generation

#### Random Password Generator
```javascript
// Generate a random password
const password = generatePassword({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true
});
console.log(password); // e.g., "Kj9#mN2$pL8@xQ5"
```

#### Passphrase Generator
```javascript
// Generate a memorable passphrase
const passphrase = generatePassphrase({
    wordCount: 4,
    camelCase: false,
    addNumbers: true
});
console.log(passphrase); // e.g., "elephant-purple-dragon-42"
```

### Export and Reporting

#### Generate PDF Report
```javascript
// Generate a comprehensive PDF report
generatePDFReport();
// Includes: analysis results, charts, recommendations, policy templates
```

#### Export Data
```javascript
// Export as CSV
exportAsCSV(); // Downloads password-analysis.csv

// Export as JSON
exportAsJSON(); // Downloads password-analysis.json

// Export as HTML
exportAsHTML(); // Downloads password-analysis.html
```

## 🔧 API Documentation

### Core Functions

#### `calculateEntropy(password)`
Calculates the mathematical entropy of a password.
```javascript
const entropy = calculateEntropy("MyPassword123!");
console.log(entropy); // 78.5
```

**Parameters:**
- `password` (string): The password to analyze

**Returns:**
- `number`: Entropy in bits

#### `calculateSecurityScores(password)`
Calculates comprehensive security scores across 4 categories.
```javascript
const scores = calculateSecurityScores("MySecurePassword123!");
console.log(scores);
// {
//   length: 25,
//   complexity: 25,
//   uniqueness: 20,
//   security: 25,
//   total: 95
// }
```

**Parameters:**
- `password` (string): The password to analyze

**Returns:**
- `object`: Security scores object

#### `generatePassword(options)`
Generates a random password based on specified options.
```javascript
const password = generatePassword({
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true
});
```

**Parameters:**
- `options` (object): Generation options
  - `length` (number): Password length (default: 16)
  - `uppercase` (boolean): Include uppercase letters (default: true)
  - `lowercase` (boolean): Include lowercase letters (default: true)
  - `numbers` (boolean): Include numbers (default: true)
  - `special` (boolean): Include special characters (default: true)

**Returns:**
- `string`: Generated password

#### `generatePassphrase(options)`
Generates a memorable passphrase.
```javascript
const passphrase = generatePassphrase({
    wordCount: 4,
    camelCase: false,
    addNumbers: true
});
```

**Parameters:**
- `options` (object): Generation options
  - `wordCount` (number): Number of words (default: 4)
  - `camelCase` (boolean): Use camelCase format (default: false)
  - `addNumbers` (boolean): Add random numbers (default: true)

**Returns:**
- `string`: Generated passphrase

#### `generateSuggestions(password)`
Generates security improvement suggestions.
```javascript
const suggestions = generateSuggestions("weak");
console.log(suggestions);
// [
//   "Use at least 8 characters",
//   "Add uppercase letters (A-Z)",
//   "Add numbers (0-9)",
//   "Add special characters (!@#$%^&*)"
// ]
```

**Parameters:**
- `password` (string): The password to analyze

**Returns:**
- `array`: Array of improvement suggestions

### Chart Functions

#### `updateCharts(password)`
Updates all visual charts with password data.
```javascript
updateCharts("MyPassword123!");
// Updates: composition chart, strength radar, crack time chart
```

#### `updateComplianceChecklist(password)`
Updates the policy compliance checklist.
```javascript
updateComplianceChecklist("MyPassword123!");
// Updates: compliance status for all policy requirements
```

### Performance Functions

#### `PerformanceMonitor.getPerformanceStats()`
Gets performance statistics.
```javascript
const stats = PerformanceMonitor.getPerformanceStats();
console.log(stats);
// {
//   averageTime: 2.5,
//   totalAnalyses: 150,
//   slowAnalyses: 2
// }
```

**Returns:**
- `object`: Performance statistics

### Export Functions

#### `generatePDFReport()`
Generates a comprehensive PDF report.
```javascript
generatePDFReport();
// Downloads: password-security-report-YYYY-MM-DD.pdf
```

#### `exportAsCSV()`
Exports analysis data as CSV.
```javascript
exportAsCSV();
// Downloads: password-analysis.csv
```

#### `exportAsJSON()`
Exports analysis data as JSON.
```javascript
exportAsJSON();
// Downloads: password-analysis.json
```

#### `exportAsHTML()`
Exports analysis data as HTML report.
```javascript
exportAsHTML();
// Downloads: password-analysis.html
```

## 🧪 Testing

### Running Tests
Tests automatically run in development mode (localhost):
```bash
# Start local server
python -m http.server 8000

# Open browser and check console for test results
open http://localhost:8000
```

### Manual Test Execution
```javascript
// Run all tests
TestSuite.runAllTests();

// Run specific test categories
TestSuite.tests[0](); // Core functions
TestSuite.tests[1](); // Edge cases
TestSuite.tests[2](); // Performance tests
```

### Test Coverage
- ✅ Core function testing
- ✅ Edge case handling
- ✅ Performance benchmarking
- ✅ Integration testing
- ✅ Error handling validation

## 🎨 Customization

### Theme Customization
```css
/* Custom CSS variables for theming */
:root {
    --primary: #007bff;
    --success: #28a745;
    --warning: #ffc107;
    --danger: #dc3545;
    --info: #17a2b8;
}
```

### Adding Custom Password Patterns
```javascript
// Add custom pattern to pattern detection
const customPattern = /your-pattern/;
if (customPattern.test(password)) {
    // Handle custom pattern
}
```

### Extending Security Scoring
```javascript
// Add custom scoring criteria
function customScoreCriteria(password) {
    // Your custom scoring logic
    return score;
}
```

## 🔧 Configuration

### Performance Settings
```javascript
// Debounce delay for real-time analysis
const DEBOUNCE_DELAY = 150; // milliseconds

// Maximum password length for analysis
const MAX_PASSWORD_LENGTH = 1000;

// Performance thresholds
const SLOW_ANALYSIS_THRESHOLD = 50; // milliseconds
```

### Security Policy Templates
```javascript
// Custom security policies
const customPolicies = {
    strict: {
        minLength: 20,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecial: true,
        maxAge: 30,
        preventReuse: 20
    }
};
```

## 🐛 Troubleshooting

### Common Issues

#### Slow Performance
- **Cause**: Very long passwords or complex patterns
- **Solution**: Password length is automatically limited to 1000 characters

#### Charts Not Updating
- **Cause**: Chart.js library not loaded
- **Solution**: Check internet connection for CDN resources

#### PDF Generation Fails
- **Cause**: jsPDF library not loaded
- **Solution**: Verify CDN resources are accessible

### Debug Commands
```javascript
// Check performance statistics
console.log(PerformanceMonitor.getPerformanceStats());

// Test specific password analysis
const result = calculateSecurityScores('testpassword123');
console.log('Analysis result:', result);

// Check chart status
if (compositionChart) {
    console.log('Charts loaded successfully');
}
```

## 📊 Performance Benchmarks

### Target Metrics
- **Single Password Analysis**: < 1ms
- **Bulk Analysis (1000 passwords)**: < 5ms per password
- **Password Generation**: < 10ms per generation
- **Chart Updates**: < 16ms (60fps target)
- **UI Responsiveness**: < 50ms total delay

### Performance Monitoring
```javascript
// Monitor performance in real-time
const stats = PerformanceMonitor.getPerformanceStats();
console.log(`Average analysis time: ${stats.averageTime.toFixed(2)}ms`);
console.log(`Total analyses: ${stats.totalAnalyses}`);
console.log(`Slow analyses: ${stats.slowAnalyses}`);
```

## 🤝 Contributing

### Development Setup
```bash
# Clone the repository
git clone https://github.com/deepakuy/password-strength-analyzer.git

# Navigate to the directory
cd password-strength-analyzer

# Start development server
python -m http.server 8000

# Run tests
open http://localhost:8000 # Tests run automatically in console
```

### Code Style
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code structure
- Test new features thoroughly

### Submitting Changes
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chart.js**: For beautiful visualizations
- **jsPDF**: For PDF report generation
- **Font Awesome**: For icons
- **zxcvbn**: For advanced password analysis

## 📞 Support

### Getting Help
- **Issues**: Report bugs and request features on GitHub
- **Documentation**: Check the [TESTING.md](TESTING.md) for detailed testing information
- **Examples**: See usage examples in this README

### Community
- **GitHub Discussions**: Share ideas and ask questions
- **Contributions**: Submit pull requests and improvements
- **Feedback**: Help improve the tool with your suggestions

## 🔄 Version History

### v2.0.0 (Current)
- ✅ Comprehensive test suite
- ✅ Performance optimizations
- ✅ PDF report generation
- ✅ Visual analytics
- ✅ Security score cards
- ✅ Export functionality
- ✅ Policy templates

### v1.0.0
- ✅ Basic password analysis
- ✅ Strength meter
- ✅ Suggestions panel
- ✅ Password generation

---

**🔒 Password Strength Analyzer** - Making password security analysis accessible, comprehensive, and professional.
