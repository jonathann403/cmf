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
            handlerType = handlerNode.name;
            const externalFunctionParams = this._findExternalHandlerParams(handlerNode.name, fileAst);
            parameters = externalFunctionParams.length > 0 ? externalFunctionParams : ['unknown'];
        }

        console.log(`Listener type: ${listener.type}, Handler: ${handlerType}, Parameters: ${parameters.join(', ')}`);
        
        // Find sinks in the handler
        const sinks = this._findSinks(handlerNode);
        if (sinks.length > 0) {
            console.log(`Found ${sinks.length} potential sinks:`, sinks);
        }
    }

    _findSinks(handlerNode) {
        const sinks = [];

        if (!handlerNode) return sinks;

        this._traverseNode(handlerNode, (node) => {
            if (node.type === 'CallExpression' && 
                node.callee.type === 'Identifier' && 
                node.callee.name === 'eval') {
                sinks.push({
                    type: 'eval',
                    line: node.loc ? node.loc.start.line : 'unknown'
                });
            }
        });

        return sinks;
    }

    _traverseNode(node, visitor) {
        if (!node || typeof node !== 'object') return;
        
        visitor(node);
        
        for (const key in node) {
            const child = node[key];
            if (Array.isArray(child)) {
                child.forEach(item => this._traverseNode(item, visitor));
            } else if (child && typeof child === 'object' && child.type) {
                this._traverseNode(child, visitor);
            }
        }
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