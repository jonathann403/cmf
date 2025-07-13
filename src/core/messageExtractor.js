class MessageExtractor {
    constructor(astParser) {
        this.astParser = astParser;
    }

    extractMessageHandlers(ast) {
        const messageHandlers = [];
        
        this.astParser.traverse(ast, {
            CallExpression: (path) => {
                const handler = this._extractEventListenerHandler(path.node);
                if (handler) { messageHandlers.push(handler); }
            },
            AssignmentExpression: (path) => {
                const handler = this._extractOnMessageHandler(path.node);
                if (handler) { messageHandlers.push(handler); }
            }
        });
        
        return messageHandlers;
    }

    _extractEventListenerHandler(node) {
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

    _extractOnMessageHandler(node) {
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