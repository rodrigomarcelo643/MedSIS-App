# Testing Strategy & Runner Guide

## Overview
Our testing configuration operates primarily through a custom Node validation script rather than a standard Jest framework. This ensures our app adheres strictly to code quality and safety standards before deployment.

We maintain a strict **100% Passing Metric** for core architectural requirements.

## The Test Runner (`tests/test-runner.js`)
Instead of mounting components virtually, our `test-runner.js` utilizes static analysis mapping rules over real file contents.

### What is tested?
1. **TypeScript Type Safety**: 
   - Strict limitations on the `: any` wildcard. (Fails files with excessive explicit `any` usage).
2. **Resilient Error Handling**: 
   - Enforces `try/catch` block wrapping around sensitive operations in feature files.
3. **Null Defenses**: 
   - Validates that UI rendering and logic chains use optional chaining (`?.`) or nullish coalescing logic (`||` or `??`) so the app does not crash on undefined API responses.
4. **Data Formatting Checkers**:
   - Assesses logical boundaries on Student ID regex (e.g., `YYYY-NNNNN`), email constraints, and comprehensive password strength validations.

### How to Run
```bash
node tests/test-runner.js
```
*Wait for the script to analyze the AST / File string contents.*
It groups output visually by logic boundaries (Authentication, Messaging, Profile) and explicitly lists TypeScript compilation warnings.

## Quality Gates
If you push a component that fails the `test-runner.js` structural validation (for example, hardcoding an API request without a `try/catch` block), the file is marked as `FAILED`, and the local build / CI checks should not proceed.
