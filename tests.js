/**
 * Comprehensive Test Suite for Password Strength Analyzer
 */

// Test utilities
const TestSuite = {
    tests: [],
    passed: 0,
    failed: 0,
    
    describe(testName, testFn) {
        console.group(`🧪 ${testName}`);
        testFn();
        console.groupEnd();
    },
    
    it(testName, testFn) {
        try {
            testFn();
            console.log(`✅ ${testName}`);
            this.passed++;
        } catch (error) {
            console.error(`❌ ${testName}: ${error.message}`);
            this.failed++;
        }
    },
    
    expect(actual) {
        return {
            toBe(expected) {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toEqual(expected) {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
                }
            },
            toBeGreaterThan(expected) {
                if (actual <= expected) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            },
            toBeLessThan(expected) {
                if (actual >= expected) {
                    throw new Error(`Expected ${actual} to be less than ${expected}`);
                }
            },
            toContain(expected) {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected ${actual} to contain ${expected}`);
                }
            },
            toHaveLength(expected) {
                if (actual.length !== expected) {
                    throw new Error(`Expected length ${expected}, but got ${actual.length}`);
                }
            },
            toBeDefined() {
                if (actual === undefined) {
                    throw new Error('Expected value to be defined');
                }
            }
        };
    },
    
    runAllTests() {
        console.log('🚀 Starting Comprehensive Test Suite...\n');
        this.tests.forEach(test => test());
        
        console.log('\n📊 Test Results:');
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    }
};

// Test data
const testPasswords = {
    empty: '',
    weak: '123',
    common: 'password',
    strong: 'Str0ng!P@ss',
    excellent: 'MyV3ryS3cur3P@ssw0rd!',
    unicode: 'p@sswórd123',
    emoji: 'password🚀123',
    veryLong: 'a'.repeat(100) + 'A'.repeat(100) + '1'.repeat(100) + '!'.repeat(100),
    repeating: 'aaaaaaa',
    sequential: '123456789',
    keyboard: 'qwerty'
};

// Test Suite 1: Core Functions
TestSuite.tests.push(() => {
    TestSuite.describe('Core Password Analysis Functions', () => {
        TestSuite.it('calculateEntropy - Empty password', () => {
            const result = calculateEntropy(testPasswords.empty);
            TestSuite.expect(result).toBe(0);
        });
        
        TestSuite.it('calculateEntropy - Strong password', () => {
            const result = calculateEntropy(testPasswords.excellent);
            TestSuite.expect(result).toBeGreaterThan(80);
        });
        
        TestSuite.it('calculateSecurityScores - Empty password', () => {
            const scores = calculateSecurityScores(testPasswords.empty);
            TestSuite.expect(scores.total).toBe(25);
        });
        
        TestSuite.it('calculateSecurityScores - Strong password', () => {
            const scores = calculateSecurityScores(testPasswords.excellent);
            TestSuite.expect(scores.total).toBeGreaterThan(80);
        });
    });
});

// Test Suite 2: Edge Cases
TestSuite.tests.push(() => {
    TestSuite.describe('Edge Cases and Error Handling', () => {
        TestSuite.it('Null and undefined inputs', () => {
            TestSuite.expect(calculateEntropy(null)).toBe(0);
            TestSuite.expect(calculateEntropy(undefined)).toBe(0);
        });
        
        TestSuite.it('Very long passwords', () => {
            const scores = calculateSecurityScores(testPasswords.veryLong);
            TestSuite.expect(scores.length).toBe(25);
        });
        
        TestSuite.it('Unicode characters', () => {
            const scores = calculateSecurityScores(testPasswords.unicode);
            TestSuite.expect(scores).toBeDefined();
        });
    });
});

// Test Suite 3: Performance Tests
TestSuite.tests.push(() => {
    TestSuite.describe('Performance Tests', () => {
        TestSuite.it('Single password analysis performance', () => {
            const startTime = performance.now();
            for (let i = 0; i < 1000; i++) {
                calculateSecurityScores(testPasswords.excellent);
            }
            const endTime = performance.now();
            const timePerPassword = (endTime - startTime) / 1000;
            TestSuite.expect(timePerPassword).toBeLessThan(1);
        });
    });
});

// Export for use in main application
window.TestSuite = TestSuite;
window.testPasswords = testPasswords;
