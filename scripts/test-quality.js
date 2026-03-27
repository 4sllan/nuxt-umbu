#!/usr/bin/env node

/**
 * Test Quality Analysis Script
 * Analyzes test quality metrics and provides recommendations
 */

import { readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

function analyzeTestQuality() {
  const testDir = join(process.cwd(), 'test')
  
  if (!existsSync(testDir)) {
    console.log('❌ Test directory not found')
    return
  }

  try {
    const testFiles = readdirSync(testDir).filter(file => file.endsWith('.test.ts'))
    const totalTests = testFiles.length
    const averageTestsPerFile = totalTests > 0 ? Math.round(totalTests / testFiles.length * 10) / 10 : 0

    // Categorize test types
    const testTypes = {
      unit: 0,
      integration: 0,
      middleware: 0,
      helpers: 0
    }

    testFiles.forEach(file => {
      if (file.includes('integration')) {testTypes.integration++}
      else if (file.includes('middleware')) {testTypes.middleware++}
      else if (file.includes('helpers')) {testTypes.helpers++}
      else {testTypes.unit++}
    })

    console.log('\\n🧪 Test Quality Analysis')
    console.log('========================')
    console.log(`📁 Total test files: ${totalTests}`)
    console.log(`📊 Average tests per file: ${averageTestsPerFile}`)
    
    console.log('\\n📋 Test Distribution:')
    console.log(`   🔬 Unit tests: ${testTypes.unit}`)
    console.log(`   🔗 Integration tests: ${testTypes.integration}`)
    console.log(`   🛡️  Middleware tests: ${testTypes.middleware}`)
    console.log(`   🛠️  Helper tests: ${testTypes.helpers}`)

    // Quality checks
    console.log('\\n✅ Quality Checks:')
    
    const checks = [
      {
        name: 'Sufficient test coverage',
        passed: totalTests >= 10,
        description: 'At least 10 test files'
      },
      {
        name: 'Balanced test types',
        passed: testTypes.integration > 0 && testTypes.middleware > 0 && testTypes.helpers > 0,
        description: 'Has integration, middleware, and helper tests'
      },
      {
        name: 'Reasonable file distribution',
        passed: averageTestsPerFile <= 50,
        description: 'Average tests per file not too high'
      }
    ]

    checks.forEach(check => {
      const status = check.passed ? '✅' : '⚠️'
      console.log(`   ${status} ${check.name}: ${check.passed ? 'PASS' : 'NEEDS ATTENTION'}`)
      if (!check.passed) {
        console.log(`      💡 ${check.description}`)
      }
    })

    // Recommendations
    console.log('\\n💡 Recommendations:')
    
    if (testTypes.integration === 0) {
      console.log('   - Add integration tests for end-to-end workflows')
    }
    
    if (testTypes.middleware === 0) {
      console.log('   - Add middleware tests for authentication flows')
    }
    
    if (testTypes.helpers === 0) {
      console.log('   - Add helper function tests for utilities')
    }
    
    if (averageTestsPerFile > 30) {
      console.log('   - Consider splitting large test files into smaller, focused files')
    }
    
    if (totalTests < 10) {
      console.log('   - Add more comprehensive test coverage')
    }

    console.log('\\n🎯 Next Steps:')
    console.log('   1. Run tests: npm run test')
    console.log('   2. Check coverage: npm run test:coverage')
    console.log('   3. Analyze results: npm run test:quality')

  } catch (error) {
    console.error('❌ Error analyzing test quality:', error)
  }
}

// Simple check for direct execution
if (process.argv[1] && process.argv[1].endsWith('test-quality.js')) {
  analyzeTestQuality()
}

export { analyzeTestQuality }
