class MessageExtractor {
    constructor(astParser) {
        this.astParser = astParser;
    }

    extractMessageListeners(ast) {
        const messageListeners = [];
        
        this.astParser.traverse(ast, {
            CallExpression: (path) => {
                const listener = this._extractEventListener(path.node);
                if (listener) { messageListeners.push(listener); }
            },
            AssignmentExpression: (path) => {
                const listener = this._extractOnMessageListener(path.node);
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
}

module.exports = { MessageExtractor };