# CMF (Critical Message Flow)

A specialized static analysis tool engineered for detecting security vulnerabilities in client-side JavaScript message event listeners. CMF addresses a critical gap in web application security by focusing specifically on postMessage API vulnerabilities, iframe communication attacks, cross-origin message exploits, and XSS through message handling.

## Vision & Mission

**Mission**: Secure the client-side web by making message listener vulnerabilities detectable, understandable, and preventable.

**Vision**: Become the industry standard for client-side message security analysis, empowering developers to build secure cross-origin communication in modern web applications.

## Problem Space

Modern web applications increasingly rely on complex client-side communication patterns:
- **iframe integration** for embedded content and widgets
- **postMessage API** for cross-origin communication
- **WebWorker messaging** for background processing
- **Browser extension messaging** for enhanced functionality

These patterns introduce unique security risks that traditional static analysis tools miss:
- **Cross-origin data injection** through unvalidated message sources
- **XSS via message data** when handlers process untrusted content
- **Code injection** through eval() usage with message payloads
- **Privilege escalation** in browser extensions and Electron apps

## Core Capabilities

### Message Listener Detection
- **Universal Pattern Recognition**: `window.addEventListener('message', ...)`, `window.onmessage = ...`
- **Framework Integration**: React, Vue, Angular message handling patterns
- **Browser Extension APIs**: Chrome/Firefox extension messaging systems
- **WebWorker Communication**: Dedicated and shared worker message handlers
- **Electron IPC**: Inter-process communication in desktop applications

### Security Analysis Engine
- **Handler-Specific Analysis**: Deep inspection of message handler function implementations
- **Taint Flow Tracking**: Traces untrusted message data through application logic
- **Sink Detection**: Identifies dangerous operations with message-derived data:
  - **Code Execution**: `eval()`, `Function()`, `setTimeout()` with string arguments
  - **DOM Manipulation**: `innerHTML`, `outerHTML`, `document.write()` assignments
  - **Network Operations**: Fetch/XHR with message-controlled URLs
  - **Storage Operations**: localStorage/sessionStorage with untrusted data

### Vulnerability Classification
- **Severity Assessment**: HIGH/MEDIUM/LOW risk categorization
- **Exploit Scenarios**: Detailed attack vector documentation
- **Mitigation Guidance**: Specific remediation recommendations
- **False Positive Reduction**: Context-aware analysis to minimize noise

## Architecture Philosophy

CMF is built on a **modular, extensible architecture** designed for evolution and specialization:

### Design Principles
1. **Separation of Concerns**: Each component has a single, well-defined responsibility
2. **Extensibility**: New message patterns and vulnerability types can be added seamlessly
3. **Performance**: Efficient AST processing for large-scale web applications
4. **Accuracy**: Context-aware analysis to minimize false positives
5. **Usability**: Clear, actionable output for developers and security teams

### Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CLI Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Command       │  │   Argument      │  │   Output     │ │
│  │   Parsing       │  │   Validation    │  │   Formatting │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    Analysis Engine                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │     Scanner     │  │ FileProcessor   │  │ MessageExtractor│
│  │  (Discovery)    │  │  (AST Gen)      │  │  (Pattern Rec) │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  FlowAnalyzer   │  │ SecurityAuditor │                  │
│  │ (Taint Track)   │  │  (Vuln Detect)  │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                  Foundation Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   AST Parser    │  │   File Utils    │  │   Report     │ │
│  │  (Babel Core)   │  │  (Type Detect)  │  │  Generation  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### **Scanner** (`src/core/scanner.js`)
- **Purpose**: Web application file discovery and filtering
- **Capabilities**: Recursive directory traversal, file type detection, ignore pattern processing
- **Output**: Curated list of analyzable files (.js, .ts, .jsx, .tsx, .html)

#### **FileProcessor** (`src/core/fileProcessor.js`)
- **Purpose**: File content processing and AST generation
- **Capabilities**: Multi-format parsing, HTML script extraction, error handling
- **Output**: Structured file data with parsed AST and metadata

#### **MessageExtractor** (`src/core/messageExtractor.js`)
- **Purpose**: Message listener pattern recognition
- **Capabilities**: addEventListener/onmessage detection, handler extraction, parameter analysis
- **Output**: Comprehensive list of message handlers with function signatures

#### **FlowAnalyzer** (`src/core/flowAnalyzer.js`)
- **Purpose**: Handler-specific code analysis and taint tracking
- **Capabilities**: Function signature analysis, parameter detection, basic flow analysis
- **Output**: Enhanced handler data with detailed function information

#### **SecurityAuditor** (`src/core/securityAuditor.js`)
- **Purpose**: Vulnerability detection and risk assessment
- **Capabilities**: Sink detection, severity classification, exploit documentation
- **Output**: Comprehensive security report with actionable findings

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cmf

# Install dependencies
npm install
```

### Basic Usage

```bash
# Analyze entire web application
node src/cli/index.js <directory-path>

# Analyze single file
node src/cli/index.js --file <file-path>
node src/cli/index.js -f <file-path>
```

### Example Analysis

```bash
# Comprehensive project scan
node src/cli/index.js ./webapp

# Single file deep dive  
node src/cli/index.js --file ./src/messaging.js

# Test with provided samples
node src/cli/index.js test-project
```

## Current Implementation Status

### ✅ Completed Features (Sprint 1-2)

#### **Foundation Layer**
- **Modular Architecture**: Clean separation of concerns across 5 core components
- **File Discovery**: Recursive scanning with smart filtering (.js, .ts, .jsx, .tsx, .html)
- **AST Processing**: Babel-powered parsing with comprehensive error handling
- **CLI Interface**: Production-ready command-line tool with help and validation

#### **Message Handler Detection** 
- **Universal Patterns**: Both `addEventListener('message', ...)` and `window.onmessage = ...`
- **Function Analysis**: Inline functions, arrow functions, external function references
- **Parameter Extraction**: Automatic detection of handler parameter names (event, e, msg, etc.)
- **Context Tracking**: Precise line numbers and source location tracking

#### **Security Analysis Engine**
- **Handler-Specific Scanning**: Deep analysis within message handler function bodies
- **Sink Detection**: Identifies dangerous operations (eval, innerHTML, document.write)
- **Severity Classification**: HIGH/MEDIUM risk categorization with detailed descriptions
- **Real-time Logging**: Live function signature analysis during processing

#### **Reporting System**
- **Console Output**: Rich, formatted reports with vulnerability details and code context
- **JSON Export**: Machine-readable reports for CI/CD integration (report.js)
- **Statistics**: Comprehensive metrics (file counts, handler counts, vulnerability counts)

### 🚧 In Development (Current Sprint)

#### **Advanced Flow Analysis**
- **Taint Tracking**: Following untrusted data from message events to dangerous sinks
- **Inter-procedural Analysis**: Cross-function vulnerability detection
- **Complex Sink Patterns**: setTimeout, fetch, localStorage with message data

#### **Enhanced Pattern Recognition**
- **Framework Integration**: React, Vue, Angular specific message patterns
- **WebWorker Support**: Dedicated and shared worker message handling
- **Browser Extension APIs**: Chrome/Firefox extension messaging detection

### 🎯 Planned Features (Roadmap)

#### **Advanced Security Analysis**
- **Origin Validation Analysis**: Detecting missing or weak origin checks
- **Prototype Pollution Detection**: Message-based prototype pollution attacks
- **Context-Aware Filtering**: Reduced false positives through smart analysis

#### **Enterprise Features**
- **Configuration System**: Custom rules, ignore patterns, severity thresholds
- **Dashboard Interface**: Interactive HTML dashboard with flow visualizations
- **CI/CD Integration**: GitHub Actions, GitLab CI pipeline support
- **Multi-format Reporting**: SARIF, XML, CSV export options

### CLI Interface

```bash
Usage: node src/cli/index.js [options] <path>

Options:
  -f, --file    Analyze a single file instead of directory
  -h, --help    Display usage information

Examples:
  node src/cli/index.js ./webapp                    # Scan entire application
  node src/cli/index.js --file ./src/messaging.js  # Single file analysis
  node src/cli/index.js test-project               # Test with samples
```

## Analysis Output

### Real-time Console Analysis
```
Analyzing single file: /webapp/messaging.js
Handler type: addEventListener, Function: FunctionExpression, Parameters: event
Handler type: onmessage, Function: ArrowFunctionExpression, Parameters: e
Handler type: addEventListener, Function: ExternalFunction, Parameters: msgEvent

Found 12 web application files:
javascript /webapp/core.js ⚠️  2 vulnerabilities 📨 3 handlers
typescript /webapp/utils.ts ✅ no vulnerabilities 📨 5 handlers  
html      /webapp/index.html ✅ no vulnerabilities

Security Analysis Summary:
  Total message handlers found: 49
  Total vulnerabilities found: 8
```

### Detailed Vulnerability Reports
```
Detailed Vulnerability Report:
📁 /webapp/messaging.js
   🔴 eval - Line 15 (HIGH SEVERITY)
      Code: eval(event.data.code);
      Description: Direct eval() call - code injection risk
   
   🔴 innerHTML - Line 23 (MEDIUM SEVERITY)  
      Code: element.innerHTML = event.data.html;
      Description: innerHTML assignment - potential XSS risk

📁 /webapp/iframe-handler.js
   🔴 document.write - Line 8 (HIGH SEVERITY)
      Code: document.write(event.data.content);
      Description: document.write() call - XSS risk
```

### Structured JSON Output (`report.js`)
```javascript
{
  "timestamp": "2025-07-14T07:00:00.000Z",
  "summary": {
    "totalFiles": 12,
    "totalMessageHandlers": 49,
    "totalVulnerabilities": 8
  },
  "files": [{
    "filePath": "/webapp/messaging.js",
    "messageHandlers": [
      {
        "type": "addEventListener",
        "line": 10,
        "target": "window"
      }
    ],
    "vulnerabilities": [
      {
        "type": "eval",
        "severity": "high", 
        "description": "Direct eval() call - code injection risk",
        "line": 15,
        "handlerType": "addEventListener",
        "handlerLine": 10,
        "code": "eval(event.data.code);"
      }
    ]
  }]
}
```

## Supported Technologies

### File Types
- **JavaScript**: `.js` files with ES5-ES2022+ syntax support
- **TypeScript**: `.ts` files with full TypeScript language support  
- **React**: `.jsx`, `.tsx` files with JSX syntax parsing
- **HTML**: `.html` files with inline script extraction

### Framework Support (Planned)
- **React**: Component-based message handling patterns
- **Vue.js**: Vue-specific event system integration
- **Angular**: Service-based communication patterns
- **WebWorkers**: Dedicated and shared worker messaging
- **Browser Extensions**: Chrome/Firefox extension APIs

### Smart Filtering
**Automatically skipped**: `node_modules`, `.git`, `dist`, `build`, `coverage`, and other build artifacts

## Development Methodology

### Sprint-Based Development
CMF follows a **20-week sprint methodology** designed for a 2-person team:

- **Weeks 1-8**: MVP development (Foundation + Core Features)
- **Weeks 9-12**: Advanced features (Framework Integration + Flow Analysis)
- **Weeks 13-16**: Enterprise features (Reporting + Performance)
- **Weeks 17-20**: Production readiness (Polish + Community)

### Current Status: Sprint 2 (Weeks 3-4)
- ✅ **Sprint 1 Complete**: Foundation, basic detection, AST processing
- 🚧 **Sprint 2 Active**: iframe communication, advanced patterns, basic taint tracking
- 🎯 **Next**: Cross-origin security analysis and XSS detection

### Quality Assurance
- **Test-Driven Development**: Comprehensive test cases for each component
- **Continuous Validation**: Testing against real-world vulnerable applications
- **Performance Benchmarks**: <30 second analysis for large codebases
- **Accuracy Metrics**: <10% false positive rate target

## Technology Stack

### Core Technologies
```yaml
Runtime:     Node.js 16+ (analysis engine)
Parsing:     @babel/parser, @babel/traverse (AST)
HTML:        jsdom (DOM parsing)
CLI:         Native Node.js (lightweight)
Testing:     Jest (unit/integration tests)
```

### Dependencies
```json
{
  "dependencies": {
    "@babel/parser": "^7.x",
    "@babel/traverse": "^7.x", 
    "jsdom": "^22.x",
    "js-beautify": "^1.x"
  }
}
```

## Project Structure

```
cmf/
├── src/                           # Source code
│   ├── cli/
│   │   └── index.js              # CLI interface & orchestration
│   ├── core/                     # Analysis engine
│   │   ├── scanner.js           # File discovery & filtering  
│   │   ├── fileProcessor.js     # AST generation & processing
│   │   ├── messageExtractor.js  # Pattern recognition engine
│   │   ├── flowAnalyzer.js      # Handler analysis & taint tracking
│   │   ├── securityAuditor.js   # Vulnerability detection & classification
│   │   └── astParser.js         # Babel wrapper & utilities
│   └── utils/
│       └── fileUtils.js         # File type detection & validation
├── test-project/                 # Validation & testing
│   ├── message-listeners-test.js     # Pattern detection tests
│   ├── vulnerable-message-handlers.js # Security vulnerability tests
│   └── [samples]/               # Real-world test cases
├── sprints/                      # Project management
│   ├── PROJECT_SPRINT_PLAN.md   # 20-week development roadmap
│   └── SPRINT_01_Features_List.md # Completed feature documentation
└── CLAUDE.md                     # Project architecture & instructions
```

## Testing & Validation

### Test Categories
1. **Pattern Detection Tests**: Verify message listener recognition accuracy
2. **Vulnerability Detection Tests**: Validate security sink identification  
3. **Performance Tests**: Ensure scalability for large codebases
4. **Integration Tests**: End-to-end workflow validation

### Sample Test Execution
```bash
# Comprehensive pattern testing (10 different handler types)
node src/cli/index.js --file test-project/message-listeners-test.js

# Security vulnerability testing (8 different sink types)  
node src/cli/index.js --file test-project/vulnerable-message-handlers.js

# Full project analysis
node src/cli/index.js test-project
```

Expected results: 49 handlers detected across 12 files, with precise vulnerability classification.

## Security Research Focus

### Threat Model
CMF addresses critical gaps in client-side security analysis:

1. **Cross-Origin Communication Attacks**
   - Unvalidated postMessage sources
   - Origin spoofing and bypass techniques
   - iframe sandboxing vulnerabilities

2. **Message-Based Code Injection**
   - eval() usage with untrusted message data
   - Function constructor exploitation
   - setTimeout/setInterval string injection

3. **DOM-Based XSS via Messages**
   - innerHTML/outerHTML with message content
   - document.write/writeln exploitation
   - Dynamic script injection patterns

4. **Browser Extension Security**
   - Content script message vulnerabilities
   - Extension privilege escalation
   - Cross-extension communication attacks

## Community & Contribution

### Project Vision
- **Open Source**: Community-driven development and vulnerability research
- **Industry Standard**: Become the go-to tool for client-side message security
- **Educational**: Raise awareness of postMessage security risks
- **Practical**: Provide actionable, developer-friendly security guidance

### Research Collaboration
Built by security researchers for the web security community:
- **Jonathan Levy**: Software Engineer & Security Researcher
- **Neta Gorelik**: Security Researcher & Developer

### Future Integrations
- **CI/CD Pipelines**: GitHub Actions, GitLab CI native support
- **IDE Extensions**: VS Code, WebStorm security highlighting
- **Security Platforms**: Integration with existing security toolchains
- **Bug Bounty**: Automated vulnerability discovery for researchers