const { ASTParser } = require('./astParser');
const { MessageExtractor } = require('./messageExtractor');

class FlowAnalyzer {
    constructor() {
        this.astParser = new ASTParser();
        this.messageExtractor = new MessageExtractor(this.astParser);
    }

    analyzeFile(fileData) {
        if (!fileData.ast) {
            return {
                filePath: fileData.path,
                messageListeners: [],
                evalCalls: []
            };
        }

        const messageListeners = this.messageExtractor.extractMessageListeners(fileData.ast);
        const enhancedListeners = this._analyzeListeners(messageListeners, fileData.ast);

        return {
            filePath: fileData.path,
            messageListeners: enhancedListeners
        };
    }

    _analyzeListeners(messageListeners, fileAst) {
        return messageListeners.map(listener => {
            this._logListenerInfo(listener, fileAst);
            return listener;
        });
    }

    _logListenerInfo(listener, fileAst) {
        if (!listener.handler) {
            console.log(`Listener type: ${listener.type}, Handler: undefined`);
            return;
        }

        const handlerNode = listener.handler;
        let handlerType = handlerNode.type;
        let parameters = [];

        if (handlerNode.type === 'FunctionExpression' || handlerNode.type === 'ArrowFunctionExpression') {
            parameters = handlerNode.params.map(param => param.name || param.type);
        } else if (handlerNode.type === 'Identifier') {
            handlerType = 'ExternalFunction';
            const externalFunctionParams = this._findExternalHandlerParams(handlerNode.name, fileAst);
            parameters = externalFunctionParams.length > 0 ? externalFunctionParams : [handlerNode.name];
        }

        console.log(`Listener type: ${listener.type}, Handler: ${handlerType}, Parameters: ${parameters.join(', ')}`);
    }

    _findExternalHandlerParams(functionName, fileAst) {
        let foundParams = [];

        this.astParser.traverse(fileAst, {
            FunctionDeclaration: (path) => {
                if (path.node.id && path.node.id.name === functionName) {
                    foundParams = path.node.params.map(param => param.name || param.type);
                }
            },
            VariableDeclarator: (path) => {
                if (path.node.id && path.node.id.name === functionName && 
                    path.node.init && 
                    (path.node.init.type === 'FunctionExpression' || path.node.init.type === 'ArrowFunctionExpression')) {
                    foundParams = path.node.init.params.map(param => param.name || param.type);
                }
            }
        });

        return foundParams;
    }
}

module.exports = { FlowAnalyzer };