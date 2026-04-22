# Agent Instructions: Testing Constraints

## Custom Test Runner Compliance
The ARDMS-App strictly adheres to a custom static validation script (`tests/test-runner.js`). All generated code will fail CI/local validation if you violate these rules:

1. **Null Safety**:
    - Absolutely no blindly trusting object properties. Use optional chaining (`data?.studentId`).
    - Use nullish coalescing (`??`) and logical OR (`||`) defaults.
2. **Error Recovery**:
    - Every Axios network interaction must be wrapped in a specific `try/catch` block.
    - Errors should trigger a UI alert or a console log based on severity. Never leave a `catch (error) {}` block empty.
3. **Type Strictness**:
    - Do not use `: any`. If a backend response is complex, define an interface for it. Files exceeding 2 instances of `any` will fail compilation.
