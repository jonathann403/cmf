const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

class ASTParser {
    constructor() {
        this.defaultOptions = {
            sourceType: 'module',
            allowImportExportEverywhere: true,
            allowReturnOutsideFunction: true,
            plugins: [
                'jsx',
                'typescript',
                'objectRestSpread',
                'dynamicImport'
            ]
        };
    }

    parse(code, options = {}) {
        const parseOptions = { ...this.defaultOptions, ...options };
        
        try {
            return parse(code, parseOptions);
        } catch (error) {
            throw new Error(`AST parsing failed: ${error.message}`);
        }
    }

    traverse(ast, visitors) {
        return traverse(ast, visitors);
    }

    getNodeLocation(node) {
        return {
            line: node.loc ? node.loc.start.line : 0,
            column: node.loc ? node.loc.start.column : 0
        };
    }

    getObjectName(node) {
        if (node.type === 'Identifier') {
            return node.name;
        } else if (node.type === 'MemberExpression') {
            return this.getObjectName(node.object) + '.' + node.property.name;
        }
        return 'unknown';
    }
}

module.exports = { ASTParser };