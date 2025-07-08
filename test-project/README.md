# CMF Test Project

This is a comprehensive test project for the CMF (Critical Message Flow) security analysis tool. It contains various web application files with different message listener patterns, including both vulnerable and secure implementations.

## Directory Structure

```
test-project/
├── index.html                    # Main HTML page with message listeners
├── public/
│   ├── iframe.html              # Iframe with message communication
│   └── popup.html               # Popup window with message handlers
├── src/
│   ├── messaging.js             # Various message listener patterns
│   ├── vulnerable-handlers.js   # Collection of vulnerable handlers
│   └── secure-handlers.js       # Examples of secure implementations
├── components/
│   ├── MessageComponent.tsx     # React TypeScript component
│   └── VueComponent.js          # Vue.js component patterns
├── utils/
│   └── communication.ts         # TypeScript communication utilities
└── workers/
    └── message-worker.js        # Web Worker with message handling
```

## Vulnerability Patterns Included

### 1. Basic Message Listeners
- `window.addEventListener('message', ...)`
- `document.addEventListener('message', ...)`
- `window.onmessage = ...`

### 2. Vulnerable Patterns
- Missing origin validation
- Direct `eval()` of message data
- `innerHTML` injection
- Dynamic script loading
- `setTimeout`/`setInterval` with strings
- Prototype pollution
- Location manipulation
- Worker creation with user data

### 3. Framework-Specific Patterns
- React hooks with message listeners
- Vue.js component message handling
- TypeScript class-based patterns
- Web Worker message communication

### 4. Advanced Patterns
- Nested functions with listeners
- IIFE with message handlers
- Class methods as message handlers
- Dynamic listener registration

## Testing with CMF

To test this project with CMF:

```bash
# Scan entire test project
node src/cli/index.js scan test-project --verbose

# Scan specific directories
node src/cli/index.js scan test-project/src --format json

# Scan individual files
node src/cli/index.js scan test-project/index.html
```

## Expected Detections

CMF should detect approximately 50+ message listener patterns across all files, including:
- HTML inline scripts with message handlers
- JavaScript files with various listener patterns
- TypeScript patterns with type annotations
- React component lifecycle listeners
- Vue.js component message handling
- Web Worker message communication

## Security Notes

This test project intentionally contains vulnerable code patterns for testing purposes. **Do not use these patterns in production applications.**

For secure message handling examples, see `src/secure-handlers.js`.