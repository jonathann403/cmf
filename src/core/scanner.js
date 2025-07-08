const fs = require('fs').promises;
const path = require('path');
const { isWebAppFile } = require('../utils/fileUtils');

class Scanner {
    constructor() {
        this.supportedExtensions = ['.html', '.js', '.ts', '.jsx', '.tsx'];
    }
    
    async scanDirectory(dirPath) {
        const files = [];
        await this._scanRecursive(dirPath, files);
        return files;
    }
    
    async _scanRecursive(dirPath, files) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (entry.isDirectory()) {
                    if (!this._shouldSkipDirectory(entry.name)) {
                        await this._scanRecursive(fullPath, files);
                    }
                } else if (entry.isFile()) {
                    if (isWebAppFile(fullPath)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.warn(`Warning: Unable to scan directory ${dirPath}: ${error.message}`);
        }
    }
    
    _shouldSkipDirectory(dirName) {
        const skipDirs = [
            'node_modules',
            '.git',
            '.vscode',
            '.idea',
            'dist',
            'build',
            'coverage',
            '.nyc_output',
            'logs'
        ];
        
        return skipDirs.includes(dirName) || dirName.startsWith('.');
    }
    
    getSupportedExtensions() {
        return [...this.supportedExtensions];
    }
}

module.exports = { Scanner };