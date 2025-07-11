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
        const evalCalls = this._detectEvalCalls(fileData.ast);

        return {
            filePath: fileData.path,
            messageHandlers: messageHandlers,
            evalCalls: evalCalls
        };
    }

    _detectEvalCalls(ast) {
        const evalCalls = [];

        this.astParser.traverse(ast, {
            CallExpression: (path) => {
                const node = path.node;
                
                if (node.callee.type === 'Identifier' && node.callee.name === 'eval') {
                    evalCalls.push({
                        line: node.loc ? node.loc.start.line : 0
                    });
                }
            }
        });

        return evalCalls;
    }
}

module.exports = { FlowAnalyzer };