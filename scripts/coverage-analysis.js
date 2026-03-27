#!/usr/bin/env node

/**
 * Coverage Analysis Script
 * Analyzes test coverage and generates detailed reports
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

function analyzeCoverage() {
  const coveragePath = join(process.cwd(), 'coverage', 'coverage-final.json')
  
  if (!existsSync(coveragePath)) {
    console.log('❌ Coverage report not found. Run tests with coverage first:')
    console.log('   npm run test:coverage')
    return
  }

  try {
    const coverageData = JSON.parse(readFileSync(coveragePath, 'utf-8'))
    
    // Calculate totals from the coverage data
    const totalLines = 0, coveredLines = 0
    let totalFunctions = 0, coveredFunctions = 0
    let totalBranches = 0, coveredBranches = 0
    let totalStatements = 0, coveredStatements = 0
    
    // Process each file
    Object.values(coverageData).forEach(fileData => {
      if (fileData.s) {
        const statements = Object.values(fileData.s)
        totalStatements += statements.length
        coveredStatements += statements.filter(s => s > 0).length
      }
      
      if (fileData.f) {
        const functions = Object.values(fileData.f)
        totalFunctions += functions.length
        coveredFunctions += functions.filter(f => f > 0).length
      }
      
      if (fileData.b) {
        Object.values(fileData.b).forEach(branch => {
          totalBranches += branch.length
          coveredBranches += branch.filter(b => b > 0).length
        })
      }
    })
    
    const total = {
      lines: {
        total: totalLines,
        covered: coveredLines,
        percent: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0
      },
      functions: {
        total: totalFunctions,
        covered: coveredFunctions,
        percent: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0
      },
      branches: {
        total: totalBranches,
        covered: coveredBranches,
        percent: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0
      },
      statements: {
        total: totalStatements,
        covered: coveredStatements,
        percent: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0
      }
    }

    console.log('\\n📊 Test Coverage Analysis')
    console.log('========================')
    
    console.log(`📄 Lines: ${total.lines.percent.toFixed(2)}% (${total.lines.covered}/${total.lines.total})`)
    console.log(`🔧 Functions: ${total.functions.percent.toFixed(2)}% (${total.functions.covered}/${total.functions.total})`)
    console.log(`🌿 Branches: ${total.branches.percent.toFixed(2)}% (${total.branches.covered}/${total.branches.total})`)
    console.log(`📝 Statements: ${total.statements.percent.toFixed(2)}% (${total.statements.covered}/${total.statements.total})`)

    const thresholds = {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }

    console.log('\\n🎯 Threshold Analysis')
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
      console.log(`${status} ${metric.name}: ${metric.value.toFixed(2)}% (required: ${metric.threshold}%)`)
      if (!passed) {allPassed = false}
    })

    console.log(`\\n${allPassed ? '🎉' : '⚠️'} Overall Status: ${allPassed ? 'All thresholds met!' : 'Some thresholds not met.'}`)
    
    if (!allPassed) {
      console.log('\\n💡 Suggestions to improve coverage:')
      console.log('   - Add tests for uncovered functions and methods')
      console.log('   - Test edge cases and error conditions')
      console.log('   - Add integration tests for complex workflows')
      console.log('   - Test middleware and helper functions')
    }

    console.log('\\n📁 Detailed reports available at:')
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
