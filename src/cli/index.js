#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { Scanner } = require('../core/scanner');
const { FileProcessor } = require('../core/fileProcessor');
const { FlowAnalyzer } = require('../core/flowAnalyzer');
const { SecurityAuditor } = require('../core/securityAuditor');

function printUsage() {
    console.log('Usage: node src/cli/index.js <directory-path>');
    console.log('');
    console.log('Examples:');
    console.log('  node src/cli/index.js ./test-project');
    console.log('  node src/cli/index.js /path/to/webapp');
}

function printResults(results, securityReports) {
    console.log(`\nFound ${results.length} web application files:\n`);
    
    const fileTypes = {};
    let totalVulnerabilities = 0;
    let totalMessageHandlers = 0;
    
    results.forEach((file, index) => {
        const ext = path.extname(file.path);
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        
        const securityReport = securityReports[index];
        const vulnCount = securityReport.vulnerabilities.length;
        const handlerCount = securityReport.messageHandlers.length;
        
        totalVulnerabilities += vulnCount;
        totalMessageHandlers += handlerCount;
        
        const vulnIndicator = vulnCount > 0 ? `⚠️  ${vulnCount} vulnerabilities` : '✅ no vulnerabilities';
        const handlerIndicator = handlerCount > 0 ? `📨 ${handlerCount} handlers` : '';
        
        console.log(`${file.type.padEnd(8)} ${file.path} ${vulnIndicator} ${handlerIndicator}`);
    });
    
    console.log('\nFile type summary:');
    Object.entries(fileTypes).forEach(([ext, count]) => {
        console.log(`  ${ext.padEnd(6)} ${count} files`);
    });
    
    console.log(`\nSecurity Analysis Summary:`);
    console.log(`  Total message handlers found: ${totalMessageHandlers}`);
    console.log(`  Total vulnerabilities found: ${totalVulnerabilities}`);
    
    if (totalVulnerabilities > 0) {
        console.log(`\nDetailed Vulnerability Report:`);
        console.log('=' .repeat(50));
        
        securityReports.forEach(report => {
            if (report.vulnerabilities.length > 0) {
                console.log(`\n📁 ${report.filePath}`);
                
                report.vulnerabilities.forEach(vuln => {
                    console.log(`   🔴 ${vuln.type} - Line ${vuln.line}`);
                    if (vuln.code) {
                        console.log(`      Code: ${vuln.code}`);
                    }
                });
            }
        });
    }
}

function writeReport(results, securityReports) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalFiles: results.length,
            totalMessageHandlers: securityReports.reduce((sum, report) => sum + (report.messageHandlers.length || 0), 0),
            totalVulnerabilities: securityReports.reduce((sum, report) => sum + report.vulnerabilities.length, 0)
        },
        files: securityReports.map(report => ({
            filePath: report.filePath,
            messageHandlers: report.messageHandlers.map(handler => ({
                type: handler.type,
                line: handler.line,
                target: handler.target
            })),
            vulnerabilities: report.vulnerabilities.map(vuln => ({
                type: vuln.type,
                line: vuln.line,
                code: vuln.code
            }))
        }))
    };

    const reportContent = `// CMF Security Analysis Report
// Generated: ${report.timestamp}

const report = ${JSON.stringify(report, null, 2)};

module.exports = report;
`;

    try {
        fs.writeFileSync('report.js', reportContent);
        console.log('\n📄 Report saved to report.js');
    } catch (error) {
        console.warn(`Warning: Could not write report.js: ${error.message}`);
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('Error: Please provide a directory path to scan');
        printUsage();
        process.exit(1);
    }
    
    const targetDir = args[0];
    const absolutePath = path.resolve(targetDir);
    
    if (!fs.existsSync(absolutePath)) {
        console.error(`Error: Directory '${targetDir}' does not exist`);
        process.exit(1);
    }
    
    if (!fs.statSync(absolutePath).isDirectory()) {
        console.error(`Error: '${targetDir}' is not a directory`);
        process.exit(1);
    }
    
    console.log(`Scanning web application directory: ${absolutePath}`);
    
    try {
        const scanner = new Scanner();
        const fileProcessor = new FileProcessor();
        const flowAnalyzer = new FlowAnalyzer();
        const securityAuditor = new SecurityAuditor();
        
        const files = await scanner.scanDirectory(absolutePath);
        
        if (files.length === 0) {
            console.log('No web application files found (.html, .js, .ts, .jsx, .tsx)');
            return;
        }
        
        const results = [];
        const securityReports = [];
        
        for (const filePath of files) {
            const fileInfo = await fileProcessor.processFile(filePath);
            results.push(fileInfo);
            
            // Analyze code flow
            const flowAnalysis = flowAnalyzer.analyzeFile(fileInfo);
            
            // Audit security vulnerabilities
            const securityReport = securityAuditor.auditFlow(flowAnalysis, fileInfo.content);
            securityReports.push(securityReport);
        }
        
        printResults(results, securityReports);
        writeReport(results, securityReports);
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}