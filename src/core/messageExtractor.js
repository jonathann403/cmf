class MessageExtractor {
    constructor(astParser) {
        this.astParser = astParser;
        this.windowReferences = new Map(); // Track variables assigned to window
    }

    extractMessageListeners(ast) {
        const messageListeners = [];
        
        // Reset window references for each AST
        this.windowReferences.clear();
        
        this.astParser.traverse(ast, {
            VariableDeclarator: (path) => {
                this._trackWindowAssignment(path.node); // refs check
            },
            AssignmentExpression: (path) => {
                // Track window assignments first
                this._trackWindowAssignment(path.node); // refs check
                
                // Then check for message listeners
                const listener = this._extractOnMessageListener(path.node);
                if (listener) { messageListeners.push(listener); }
            },
            CallExpression: (path) => {
                const listener = this._extractEventListener(path.node);
                if (listener) { messageListeners.push(listener); }
            }
        });
        
        return messageListeners;
    }

    _extractEventListener(node) {
        if (this._isWindowMessageListener(node)) {
            return {
                type: 'addEventListener',
                handler: node.arguments[1],
                line: this._getLineNumber(node),
                target: 'window'
            };
        }
        
        if (this._isWindowReferenceMessageListener(node)) {
            return {
                type: 'addEventListener',
                handler: node.arguments[1],
                line: this._getLineNumber(node),
                target: 'window_reference'
            };
        }
        
        return null;
    }

    _extractOnMessageListener(node) {
        if (this._isWindowOnMessage(node)) {
            return {
                type: 'onmessage',
                handler: node.right,
                line: this._getLineNumber(node),
                target: 'window'
            };
        }
        
        if (this._isWindowReferenceOnMessage(node)) {
            return {
                type: 'onmessage',
                handler: node.right,
                line: this._getLineNumber(node),
                target: 'window_reference'
            };
        }
        
        return null;
    }

    _isWindowMessageListener(node) {
        return node.callee.type === 'MemberExpression' &&
               node.callee.object.type === 'Identifier' &&
               node.callee.object.name === 'window' &&
               node.callee.property.name === 'addEventListener' &&
               node.arguments.length >= 2 &&
               node.arguments[0].type === 'StringLiteral' &&
               node.arguments[0].value === 'message';
    }

    _isWindowOnMessage(node) {
        return node.left.type === 'MemberExpression' &&
               node.left.object.type === 'Identifier' &&
               node.left.object.name === 'window' &&
               node.left.property.name === 'onmessage';
    }

    _getLineNumber(node) {
        return node.loc ? node.loc.start.line : 0;
    }

    _trackWindowAssignment(node) {
        // Track variable declarations: const x = window; let y = window; var z = window;
        if (node.type === 'VariableDeclarator' && 
            node.init && 
            node.init.type === 'Identifier' && 
            node.init.name === 'window' &&
            node.id && 
            node.id.type === 'Identifier') {
            this.windowReferences.set(node.id.name, true);
            return;
        }

        // Track assignment expressions: x = window;
        if (node.type === 'AssignmentExpression' && 
            node.right && 
            node.right.type === 'Identifier' && 
            node.right.name === 'window' &&
            node.left && 
            node.left.type === 'Identifier') {
            this.windowReferences.set(node.left.name, true);
            return;
        }
    }

    _isWindowReferenceMessageListener(node) {
        return node.callee.type === 'MemberExpression' &&
               node.callee.object.type === 'Identifier' &&
               this.windowReferences.has(node.callee.object.name) &&
               node.callee.property.name === 'addEventListener' &&
               node.arguments.length >= 2 &&
               node.arguments[0].type === 'StringLiteral' &&
               node.arguments[0].value === 'message';
    }

    _isWindowReferenceOnMessage(node) {
        return node.left.type === 'MemberExpression' &&
               node.left.object.type === 'Identifier' &&
               this.windowReferences.has(node.left.object.name) &&
               node.left.property.name === 'onmessage';
    }
}

module.exports = { MessageExtractor };