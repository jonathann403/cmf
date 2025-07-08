const path = require('path');

const WEB_APP_EXTENSIONS = {
    '.html': 'html',
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'jsx',
    '.tsx': 'tsx'
};

function isWebAppFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return WEB_APP_EXTENSIONS.hasOwnProperty(ext);
}

function getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return WEB_APP_EXTENSIONS[ext] || 'unknown';
}

function getFileExtension(filePath) {
    return path.extname(filePath).toLowerCase();
}

function getFileName(filePath) {
    return path.basename(filePath);
}

function getDirectoryName(filePath) {
    return path.dirname(filePath);
}

function getSupportedExtensions() {
    return Object.keys(WEB_APP_EXTENSIONS);
}

module.exports = {
    isWebAppFile,
    getFileType,
    getFileExtension,
    getFileName,
    getDirectoryName,
    getSupportedExtensions,
    WEB_APP_EXTENSIONS
};