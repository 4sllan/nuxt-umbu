#!/usr/bin/env node

/**
 * Test Coverage Configuration Script
 * Configures and validates test coverage thresholds for nuxt-umbu
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const DEFAULT_THRESHOLDS = {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}

const DEFAULT_CONFIG = {
  provider: 'v8',
  reporter: ['text', 'lcov', 'html', 'json-summary'],
  reportsDirectory: './coverage',
  exclude: [
    'playground/**',
    'test/e2e/**',
    'dist/**',
    '**/*.d.ts',
    '**/*.config.*',
    '**/node_modules/**'
  ],
  all: true,
  include: ['src/**/*.ts', 'src/**/*.js'],
  thresholds: DEFAULT_THRESHOLDS
}

function updateVitestConfig(configPath, coverageConfig) {
  try {
    const configContent = readFileSync(configPath, 'utf-8')
    
    // Simple regex replacement for coverage config
    const coverageRegex = /coverage:\s*\{[^}]*\}/
    const newCoverageConfig = 'coverage: ' + JSON.stringify(coverageConfig, null, 6)
    
    let newConfigContent
    if (coverageRegex.test(configContent)) {
      newConfigContent = configContent.replace(coverageRegex, newCoverageConfig)
    } else {
      // Add coverage config to test section
      const testSectionRegex = /(test:\s*\{[^}]*\})/
      if (testSectionRegex.test(configContent)) {
        const testSection = testSectionRegex.exec(configContent)[1]
        const newTestSection = testSection.replace(/\}$/, ',  ' + newCoverageConfig.replace('coverage: ', '') + '}')
        newConfigContent = configContent.replace(testSectionRegex, newTestSection)
      } else {
        console.error('Could not find test section in vitest config')
        return
      }
    }
    
    writeFileSync(configPath, newConfigContent, 'utf-8')
    console.log('✅ Vitest configuration updated with coverage settings')
  } catch (error) {
    console.error('❌ Error updating vitest config:', error)
  }
}

function createCoverageScript() {
  const scriptContent = `#!/usr/bin/env node

/**
 * Coverage Analysis Script
 * Analyzes test coverage and generates detailed reports
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

function analyzeCoverage() {
  const coveragePath = join(process.cwd(), 'coverage', 'coverage-summary.json')
  
  if (!existsSync(coveragePath)) {
    console.log('❌ Coverage report not found. Run tests with coverage first:')
    console.log('   npm run test:coverage')
    return
  }

  try {
    const coverageData = JSON.parse(readFileSync(coveragePath, 'utf-8'))
    const total = coverageData.total

    console.log('\\\\n📊 Test Coverage Analysis')
    console.log('========================')
    
    console.log(\`📄 Lines: \${total.lines.percent.toFixed(2)}% (\${total.lines.covered}/\${total.lines.total})\`)
    console.log(\`🔧 Functions: \${total.functions.percent.toFixed(2)}% (\${total.functions.covered}/\${total.functions.total})\`)
    console.log(\`🌿 Branches: \${total.branches.percent.toFixed(2)}% (\${total.branches.covered}/\${total.branches.total})\`)
    console.log(\`📝 Statements: \${total.statements.percent.toFixed(2)}% (\${total.statements.covered}/\${total.statements.total})\`)

    const thresholds = {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }

    console.log('\\\\n🎯 Threshold Analysis')
    console.log('====================')
    
    const metrics = [
      { name: 'Lines', value: total.lines.percent, threshold: thresholds.lines },
      { name: 'Functions', value: total.functions.percent, threshold: thresholds.functions },
      { name: 'Branches', value: total.branches.percent, threshold: thresholds.branches },
      { name: 'Statements', value: total.statements.percent, threshold: thresholds.statements }
    ]

    let allPassed = true
    metrics.forEach(metric => {
      const passed = metric.value >= metric.threshold
      const status = passed ? '✅' : '❌'
      console.log(\`\${status} \${metric.name}: \${metric.value.toFixed(2)}% (required: \${metric.threshold}%)\`)
      if (!passed) allPassed = false
    })

    console.log(\`\\\\n\${allPassed ? '🎉' : '⚠️'} Overall Status: \${allPassed ? 'All thresholds met!' : 'Some thresholds not met.'}\`)
    
    if (!allPassed) {
      console.log('\\\\n💡 Suggestions to improve coverage:')
      console.log('   - Add tests for uncovered functions and methods')
      console.log('   - Test edge cases and error conditions')
      console.log('   - Add integration tests for complex workflows')
      console.log('   - Test middleware and helper functions')
    }

    console.log('\\\\n📁 Detailed reports available at:')
    console.log('   - HTML: ./coverage/index.html')
    console.log('   - LCOV: ./coverage/lcov.info')
    console.log('   - JSON: ./coverage/coverage-summary.json')
  } catch (error) {
    console.error('❌ Error analyzing coverage:', error)
  }
}

// Simple check for direct execution
if (process.argv[1] && process.argv[1].endsWith('coverage-analysis.js')) {
  analyzeCoverage()
}

export { analyzeCoverage }
`

  const scriptPath = join(process.cwd(), 'scripts', 'coverage-analysis.js')
  writeFileSync(scriptPath, scriptContent, 'utf-8')
  console.log('✅ Coverage analysis script created')
}

function createTestQualityScript() {
  const scriptContent = `#!/usr/bin/env node

/**
 * Test Quality Analysis Script
 * Analyzes test quality metrics and provides recommendations
 */

import { readFileSync, readdirSync } from 'fs'
import { join, extname } from 'path'

function analyzeTestQuality() {
  const testDir = join(process.cwd(), 'test')
  
  if (!existsSync(testDir)) {
    console.log('❌ Test directory not found')
    return
  }

  try {
    const testFiles = readdirSync(testDir).filter(file => extname(file) === '.test.ts')
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
      if (file.includes('integration')) testTypes.integration++
      else if (file.includes('middleware')) testTypes.middleware++
      else if (file.includes('helpers')) testTypes.helpers++
      else testTypes.unit++
    })

    console.log('\\\\n🧪 Test Quality Analysis')
    console.log('========================')
    console.log(\`📁 Total test files: \${totalTests}\`)
    console.log(\`📊 Average tests per file: \${averageTestsPerFile}\`)
    
    console.log('\\\\n📋 Test Distribution:')
    console.log(\`   🔬 Unit tests: \${testTypes.unit}\`)
    console.log(\`   🔗 Integration tests: \${testTypes.integration}\`)
    console.log(\`   🛡️  Middleware tests: \${testTypes.middleware}\`)
    console.log(\`   🛠️  Helper tests: \${testTypes.helpers}\`)

    // Quality checks
    console.log('\\\\n✅ Quality Checks:')
    
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
      console.log(\`   \${status} \${check.name}: \${check.passed ? 'PASS' : 'NEEDS ATTENTION'}\`)
      if (!check.passed) {
        console.log(\`      💡 \${check.description}\`)
      }
    })

    // Recommendations
    console.log('\\\\n💡 Recommendations:')
    
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

    console.log('\\\\n🎯 Next Steps:')
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
`

  const scriptPath = join(process.cwd(), 'scripts', 'test-quality.js')
  writeFileSync(scriptPath, scriptContent, 'utf-8')
  console.log('✅ Test quality analysis script created')
}

function updatePackageScripts() {
  try {
    const packagePath = join(process.cwd(), 'package.json')
    const packageContent = readFileSync(packagePath, 'utf-8')
    const packageJson = JSON.parse(packageContent)
    
    // Add new test scripts
    const newScripts = {
      'test': 'vitest run --reporter=verbose --silent=false',
      'test:watch': 'vitest watch --reporter=verbose --silent=false',
      'test:debug': 'vitest --inspect-brk --reporter=verbose --silent=false',
      'test:coverage': 'vitest run --coverage --reporter=verbose',
      'test:ui': 'vitest --ui',
      'test:quality': 'node scripts/test-quality.js',
      'test:analyze': 'node scripts/coverage-analysis.js',
      'test:ci': 'vitest run --coverage --reporter=json --reporter=verbose --run',
      'pretest': 'npm run lint',
      'posttest': 'npm run test:analyze'
    }
    
    packageJson.scripts = { ...packageJson.scripts, ...newScripts }
    
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf-8')
    console.log('✅ Package.json scripts updated')
  } catch (error) {
    console.error('❌ Error updating package.json:', error)
  }
}

function createGitHubWorkflow() {
  const workflowContent = `name: Test Coverage

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run type checking
      run: npm run typecheck
      
    - name: Run tests with coverage
      run: npm run test:ci
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
        
    - name: Coverage Quality Check
      run: npm run test:analyze
      
    - name: Test Quality Report
      run: npm run test:quality
`

  const workflowDir = join(process.cwd(), '.github', 'workflows')
  const workflowPath = join(workflowDir, 'coverage.yml')
  
  try {
    writeFileSync(workflowPath, workflowContent, 'utf-8')
    console.log('✅ GitHub Actions workflow created')
  } catch (error) {
    console.error('❌ Error creating GitHub workflow:', error)
  }
}

function main() {
  console.log('🚀 Configuring test coverage and quality tools...')
  
  // Create scripts directory if it doesn't exist
  const scriptsDir = join(process.cwd(), 'scripts')
  if (!existsSync(scriptsDir)) {
    mkdirSync(scriptsDir, { recursive: true })
  }
  
  // Update vitest config
  const vitestConfigPath = join(process.cwd(), 'vitest.config.ts')
  if (existsSync(vitestConfigPath)) {
    updateVitestConfig(vitestConfigPath, DEFAULT_CONFIG)
  }
  
  // Create analysis scripts
  createCoverageScript()
  createTestQualityScript()
  
  // Update package.json scripts
  updatePackageScripts()
  
  // Create GitHub workflow
  createGitHubWorkflow()
  
  console.log('\\n✅ Test coverage configuration completed!')
  console.log('\\n📋 Available commands:')
  console.log('   npm run test              - Run all tests')
  console.log('   npm run test:watch        - Run tests in watch mode')
  console.log('   npm run test:coverage     - Run tests with coverage')
  console.log('   npm run test:quality      - Analyze test quality')
  console.log('   npm run test:analyze      - Analyze coverage results')
  console.log('   npm run test:ui           - Open test UI')
  console.log('   npm run test:ci           - Run tests for CI')
  
  console.log('\\n🎯 Next steps:')
  console.log('   1. Run: npm run test:coverage')
  console.log('   2. Check: npm run test:analyze')
  console.log('   3. Review: npm run test:quality')
  console.log('   4. Open: ./coverage/index.html')
}

// Simple check for direct execution
if (process.argv[1] && process.argv[1].endsWith('configure-coverage.js')) {
  main()
}

export { main as configureCoverage }
