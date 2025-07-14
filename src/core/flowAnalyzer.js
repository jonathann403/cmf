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
                messageHandlers: [],
                evalCalls: []
            };
        }

        const messageHandlers = this.messageExtractor.extractMessageHandlers(fileData.ast);
        const enhancedHandlers = this._analyzeHandlers(messageHandlers, fileData.ast);

        return {
            filePath: fileData.path,
            messageHandlers: enhancedHandlers
        };
    }

    _analyzeHandlers(messageHandlers, fileAst) {
        return messageHandlers.map(handler => {
            this._logHandlerInfo(handler, fileAst);
            return handler;
        });
    }

    _logHandlerInfo(handler, fileAst) {
        if (!handler.handler) {
            console.log(`Handler type: ${handler.type}, Function: undefined`);
            return;
        }

        const handlerNode = handler.handler;
        let functionType = handlerNode.type;
        let parameters = [];

        if (handlerNode.type === 'FunctionExpression' || handlerNode.type === 'ArrowFunctionExpression') {
            parameters = handlerNode.params.map(param => param.name || param.type);
        } else if (handlerNode.type === 'Identifier') {
            functionType = 'ExternalFunction';
            const externalFunctionParams = this._findExternalFunctionParams(handlerNode.name, fileAst);
            parameters = externalFunctionParams.length > 0 ? externalFunctionParams : [handlerNode.name];
        }

        console.log(`Handler type: ${handler.type}, Function: ${functionType}, Parameters: ${parameters.join(', ')}`);
    }

    _findExternalFunctionParams(functionName, fileAst) {
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