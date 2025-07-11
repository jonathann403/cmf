# CMF (Critical Message Flow)

A simple static analysis tool that scans JavaScript/TypeScript web applications for security vulnerabilities.

## What it does

CMF analyzes your web application code and finds:

- **Message Listeners**: `window.addEventListener("message", ...)` patterns
- **Eval Usage**: Dangerous `eval()` function calls that can execute arbitrary code

## Architecture

- Modular design with separated concerns
- ASTParser for generic AST operations
- MessageExtractor for message handler detection
- FlowAnalyzer for code flow analysis
- SecurityAuditor for vulnerability assessment
- CLI interface with proper error handling

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the scanner**:
   ```bash
   node src/cli/index.js <directory-path>
   ```

3. **Example**:
   ```bash
   node src/cli/index.js test-project
   ```

## Output

The tool provides two types of output:

1. **Console Report**: Human-readable vulnerability report with code snippets
2. **report.js**: Machine-readable JSON report for automation

## Example Output

```
📁 /path/to/file.js
   🔴 eval-usage - Line 25
      Code: eval(userInput);
```

## Supported File Types

- `.js` - JavaScript
- `.ts` - TypeScript  
- `.jsx` - React JavaScript
- `.tsx` - React TypeScript
- `.html` - HTML files with inline scripts

## Project Checklist

later....

## Files Structure

```
src/
├── cli/index.js          # Command-line interface
├── core/
│   ├── astParser.js      # AST parsing utilities
│   ├── fileProcessor.js  # File processing engine
│   ├── flowAnalyzer.js   # Code flow analysis
│   ├── messageExtractor.js # Message handler extraction
│   ├── scanner.js        # Directory scanning
│   └── securityAuditor.js   # Security vulnerability detection
└── utils/
    └── fileUtils.js      # File type utilities
```

## Authors

Jonathan Levy & Neta Gorelik