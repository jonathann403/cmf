const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');
const { ASTParser } = require('./astParser');
const { MessageExtractor } = require('./messageExtractor');
const { getFileType } = require('../utils/fileUtils');

class FileProcessor {
    constructor() {
        this.astParser = new ASTParser();
        this.messageExtractor = new MessageExtractor(this.astParser);
        this.supportedTypes = {
            'html': this._processHtmlFile.bind(this),
            'javascript': this._processJsFile.bind(this),
            'typescript': this._processJsFile.bind(this),
            'jsx': this._processJsFile.bind(this),
            'tsx': this._processJsFile.bind(this)
        };
    }
    
    async processFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const fileType = getFileType(filePath);
            
            const fileInfo = {
                path: filePath,
                type: fileType,
                size: content.length,
                content: content
            };
            
            if (this.supportedTypes[fileType]) {
                return await this.supportedTypes[fileType](fileInfo);
            }
            
            return fileInfo;
            
        } catch (error) {
            console.warn(`Warning: Unable to process file ${filePath}: ${error.message}`);
            return {
                path: filePath,
                type: 'unknown',
                size: 0,
                content: '',
                error: error.message
            };
        }
    }
    
    async _processHtmlFile(fileInfo) {
        try {
            const dom = new JSDOM(fileInfo.content);
            const document = dom.window.document;
            
            const inlineScripts = [];
            const scriptTags = document.querySelectorAll('script');
            
            scriptTags.forEach((script, index) => {
                if (script.textContent.trim()) {
                    inlineScripts.push({
                        index: index,
                        content: script.textContent.trim(),
                        type: script.type || 'text/javascript'
                    });
                }
            });
            
            const externalScripts = [];
            scriptTags.forEach((script, index) => {
                if (script.src) {
                    externalScripts.push({
                        index: index,
                        src: script.src,
                        type: script.type || 'text/javascript'
                    });
                }
            });
            
            return {
                ...fileInfo,
                inlineScripts: inlineScripts,
                externalScripts: externalScripts,
                scriptCount: scriptTags.length
            };
            
        } catch (error) {
            console.warn(`Warning: Error parsing HTML file ${fileInfo.path}: ${error.message}`);
            return {
                ...fileInfo,
                inlineScripts: [],
                externalScripts: [],
                scriptCount: 0,
                parseError: error.message
            };
        }
    }
    
    async _processJsFile(fileInfo) {
        try {
            const ast = this.astParser.parse(fileInfo.content);
            const messageHandlers = this.messageExtractor.extractMessageHandlers(ast);

            return {
                ...fileInfo,
                lines: fileInfo.content.split('\n').length,
                ast: ast,
                messageHandlers: messageHandlers
            };
            
        } catch (error) {
            console.warn(`Warning: Error parsing JavaScript file ${fileInfo.path}: ${error.message}`);
            return {
                ...fileInfo,
                lines: fileInfo.content.split('\n').length,
                ast: null,
                messageHandlers: [],
                parseError: error.message
            };
        }
    }
    
    getSupportedTypes() {
        return Object.keys(this.supportedTypes);
    }
}

module.exports = { FileProcessor };