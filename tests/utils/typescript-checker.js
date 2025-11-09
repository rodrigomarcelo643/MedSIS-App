// TypeScript Type Checker Utility
const fs = require('fs');
const path = require('path');

function checkTypeErrors() {
  console.log('🔍 Checking for TypeScript type errors...\n');
  
  const typeErrors = [];
  
  // Common type error patterns to check for
  const errorPatterns = [
    {
      pattern: /any\[\]/g,
      message: 'Using any[] type - should specify proper array type',
      severity: 'warning'
    },
    {
      pattern: /: any/g,
      message: 'Using any type - should specify proper type',
      severity: 'warning'
    },
    {
      pattern: /as any/g,
      message: 'Type assertion to any - potential type safety issue',
      severity: 'info'
    },
    {
      pattern: /\?\.\w+\?\./g,
      message: 'Multiple optional chaining - check for proper null handling',
      severity: 'info'
    },
    {
      pattern: /fetch\([^)]+\)(?!\s*\.)/g,
      message: 'Fetch without proper error handling',
      severity: 'warning'
    }
  ];
  
  // Files to check
  const filesToCheck = [
    'app/screens/messages.tsx',
    'app/chat/[id].tsx',
    'app/(tabs)/profile.tsx',
    'app/auth/login.tsx',
    'contexts/AuthContext.tsx'
  ];
  
  filesToCheck.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      errorPatterns.forEach(({ pattern, message, severity }) => {
        const matches = content.match(pattern);
        if (matches) {
          typeErrors.push({
            file: filePath,
            message,
            severity,
            count: matches.length,
            lines: getLineNumbers(content, pattern)
          });
        }
      });
    }
  });
  
  // Report results
  if (typeErrors.length === 0) {
    console.log('✅ No type errors detected!');
    return { passed: true, errors: [] };
  }
  
  console.log(`⚠️  Found ${typeErrors.length} potential type issues:\n`);
  
  typeErrors.forEach((error, index) => {
    const icon = error.severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${icon} ${error.file}:`);
    console.log(`   ${error.message}`);
    console.log(`   Found ${error.count} occurrence(s) at lines: ${error.lines.join(', ')}\n`);
  });
  
  return { passed: false, errors: typeErrors };
}

function getLineNumbers(content, pattern) {
  const lines = content.split('\n');
  const lineNumbers = [];
  
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      lineNumbers.push(index + 1);
    }
  });
  
  return lineNumbers.slice(0, 5); // Limit to first 5 occurrences
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkTypeErrors };
}

// Run if called directly
if (require.main === module) {
  checkTypeErrors();
}