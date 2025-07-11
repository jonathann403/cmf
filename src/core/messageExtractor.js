class MessageExtractor {
    constructor(astParser) {
        this.astParser = astParser;
    }

    extractMessageHandlers(ast) {
        const messageHandlers = [];
        
        this.astParser.traverse(ast, {
            CallExpression: (path) => {
                if (this._isWindowMessageListener(path.node)) {
                    messageHandlers.push({
                        type: 'addEventListener',
                        line: path.node.loc ? path.node.loc.start.line : 0,
                        target: 'window'
                    });
                }
            }
        });
        
        return messageHandlers;
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
}

module.exports = { MessageExtractor };