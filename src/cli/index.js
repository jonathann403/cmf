#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { Scanner } = require('../core/scanner');
const { FileProcessor } = require('../core/fileProcessor');

function printUsage() {
    console.log('Usage: node src/cli/index.js <directory-path>');
    console.log('');
    console.log('Examples:');
    console.log('  node src/cli/index.js ./test-project');
    console.log('  node src/cli/index.js /path/to/webapp');
}

function printResults(results) {
    console.log(`\nFound ${results.length} web application files:\n`);
    
    const fileTypes = {};
    results.forEach(file => {
        const ext = path.extname(file.path);
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        
        console.log(`${file.type.padEnd(8)} ${file.path}`);
    });
    
    console.log('\nFile type summary:');
    Object.entries(fileTypes).forEach(([ext, count]) => {
        console.log(`  ${ext.padEnd(6)} ${count} files`);
    });
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
        
        const files = await scanner.scanDirectory(absolutePath);
        
        if (files.length === 0) {
            console.log('No web application files found (.html, .js, .ts, .jsx, .tsx)');
            return;
        }
        
        const results = [];
        for (const filePath of files) {
            const fileInfo = await fileProcessor.processFile(filePath);
            results.push(fileInfo);
        }
        
        printResults(results);
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}