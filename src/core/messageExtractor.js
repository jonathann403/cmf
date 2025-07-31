class MessageExtractor {
    constructor(astParser) {
        this.astParser = astParser;
        this.windowReferences = new Map();      // Track variables assigned to window
        this.messageVariables = new Map();      // Track variables set to 'message'
        this.onmessageVariables = new Map();    // Track variables set to 'onmessage'
    }

    extractMessageListeners(ast) {
        const messageListeners = [];
        
        // Reset references for each AST
        this.windowReferences.clear();
        this.messageVariables.clear();
        this.onmessageVariables.clear();
        
        this.astParser.traverse(ast, {
            VariableDeclarator: (path) => {
                this._trackWindowAssignment(path.node);
            },
            AssignmentExpression: (path) => {
                // Track assignments first
                this._trackWindowAssignment(path.node);
                
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
        return node.callee &&
               node.callee.type == 'MemberExpression' &&
               node.callee.object &&
               node.callee.object.type == 'Identifier' &&
               node.callee.object.name == 'window' &&
               node.callee.property &&
               node.callee.property.name == 'addEventListener' &&
               node.arguments &&
               node.arguments.length >= 2 &&
               node.arguments[0] &&
               (// Direct string literal: 'message' or "message"
                (node.arguments[0].type == 'Literal' && node.arguments[0].value == 'message') ||
                // Template literal: `message`
                (node.arguments[0].type == 'TemplateLiteral' && 
                 node.arguments[0].expressions && 
                 node.arguments[0].expressions.length == 0 &&
                 node.arguments[0].quasis && 
                 node.arguments[0].quasis.length == 1 &&
                 node.arguments[0].quasis[0].value &&
                 node.arguments[0].quasis[0].value.cooked == 'message') ||
                // Variable reference: x where x = 'message'
                (node.arguments[0].type == 'Identifier' && 
                 this.messageVariables.has(node.arguments[0].name)));
    }

    _isWindowOnMessage(node) {
        return node.left &&
               node.left.type == 'MemberExpression' &&
               node.left.object &&
               node.left.object.type == 'Identifier' &&
               node.left.object.name == 'window' &&
               node.left.property &&
               (// Direct property: window.onmessage
                (node.left.property.type == 'Identifier' && node.left.property.name == 'onmessage') ||
                // String literal: window['onmessage'] or window["onmessage"]
                (node.left.property.type == 'Literal' && node.left.property.value == 'onmessage') ||
                // Template literal: window[`onmessage`]
                (node.left.property.type == 'TemplateLiteral' && 
                 node.left.property.expressions && 
                 node.left.property.expressions.length == 0 &&
                 node.left.property.quasis && 
                 node.left.property.quasis.length == 1 &&
                 node.left.property.quasis[0].value &&
                 node.left.property.quasis[0].value.cooked == 'onmessage') ||
                // Variable reference: window[x] where x = 'onmessage'
                (node.left.property.type == 'Identifier' && 
                 this.onmessageVariables.has(node.left.property.name)) ||
                // Binary expression concatenation: window['on' + 'message']
                (node.left.property.type == 'BinaryExpression' && 
                 this._connectBinaryExpression(node.left.property) == 'onmessage'));
    }

    _isWindowReferenceMessageListener(node) {
        return node.callee &&
               node.callee.type == 'MemberExpression' &&
               node.callee.object &&
               node.callee.object.type == 'Identifier' &&
               this.windowReferences.has(node.callee.object.name) &&
               node.callee.property &&
               node.callee.property.name == 'addEventListener' &&
               node.arguments &&
               node.arguments.length >= 2 &&
               node.arguments[0] &&
               (// Direct string literal: 'message' or "message"
                (node.arguments[0].type == 'Literal' && node.arguments[0].value == 'message') ||
                // Template literal: `message`
                (node.arguments[0].type == 'TemplateLiteral' && 
                 node.arguments[0].expressions && 
                 node.arguments[0].expressions.length == 0 &&
                 node.arguments[0].quasis && 
                 node.arguments[0].quasis.length == 1 &&
                 node.arguments[0].quasis[0].value &&
                 node.arguments[0].quasis[0].value.cooked == 'message') ||
                // Variable reference: x where x = 'message'
                (node.arguments[0].type == 'Identifier' && 
                 this.messageVariables.has(node.arguments[0].name)));
    }

    _isWindowReferenceOnMessage(node) {
        return node.left &&
               node.left.type == 'MemberExpression' &&
               node.left.object &&
               node.left.object.type == 'Identifier' &&
               this.windowReferences.has(node.left.object.name) &&
               node.left.property &&
               (// Direct property: windowRef.onmessage
                (node.left.property.type == 'Identifier' && node.left.property.name == 'onmessage') ||
                // String literal: windowRef['onmessage'] or windowRef["onmessage"]
                (node.left.property.type == 'Literal' && node.left.property.value == 'onmessage') ||
                // Template literal: windowRef[`onmessage`]
                (node.left.property.type == 'TemplateLiteral' && 
                 node.left.property.expressions && 
                 node.left.property.expressions.length == 0 &&
                 node.left.property.quasis && 
                 node.left.property.quasis.length == 1 &&
                 node.left.property.quasis[0].value &&
                 node.left.property.quasis[0].value.cooked == 'onmessage') ||
                // Variable reference: windowRef[x] where x = 'onmessage'
                (node.left.property.type == 'Identifier' && 
                 this.onmessageVariables.has(node.left.property.name)) ||
                // Binary expression concatenation: windowRef['on' + 'message']
                (node.left.property.type == 'BinaryExpression' && 
                 this._connectBinaryExpression(node.left.property) == 'onmessage'));
    }

    _getLineNumber(node) {
        return node.loc ? node.loc.start.line : 0;
    }

    _trackWindowAssignment(node) {
        if (!node) return;
        
        // Track 'window' variable declarations: const/let/var x = window
        if (node.type == 'VariableDeclarator' && 
            node.init && 
            node.init.type == 'Identifier' && 
            node.init.name == 'window' &&
            node.id && 
            node.id.type == 'Identifier') {
            this.windowReferences.set(node.id.name, true);
            return;
        }

        // Track 'message' variable declarations: const/let/var x = 'message'/"message"/`message`
        if (node.type == 'VariableDeclarator' && 
            node.init && 
            node.id && 
            node.id.type == 'Identifier') {
            
            // String literal: 'message' or "message"
            if (node.init.type == 'Literal' && node.init.value == 'message') {
                this.messageVariables.set(node.id.name, 'message');
                return;
            }
            
            // Template literal: `message`
            if (node.init.type == 'TemplateLiteral' && 
                node.init.expressions && 
                node.init.expressions.length == 0 &&
                node.init.quasis && 
                node.init.quasis.length == 1 &&
                node.init.quasis[0].value &&
                node.init.quasis[0].value.cooked == 'message') {
                this.messageVariables.set(node.id.name, 'message');
                return;
            }
        }

        // Track 'onmessage' variable declarations: const/let/var x = 'onmessage'/"onmessage"/`onmessage`
        if (node.type == 'VariableDeclarator' && 
            node.init && 
            node.id && 
            node.id.type == 'Identifier') {
            
            // String literal: 'onmessage' or "onmessage"
            if (node.init.type == 'Literal' && node.init.value == 'onmessage') {
                this.onmessageVariables.set(node.id.name, 'onmessage');
                return;
            }
            
            // Template literal: `onmessage`
            if (node.init.type == 'TemplateLiteral' && 
                node.init.expressions && 
                node.init.expressions.length == 0 &&
                node.init.quasis && 
                node.init.quasis.length == 1 &&
                node.init.quasis[0].value &&
                node.init.quasis[0].value.cooked == 'onmessage') {
                this.onmessageVariables.set(node.id.name, 'onmessage');
                return;
            }
        }

        // Track 'window' assignment expressions: x = window
        if (node.type == 'AssignmentExpression' && 
            node.right && 
            node.right.type == 'Identifier' && 
            node.right.name == 'window' &&
            node.left && 
            node.left.type == 'Identifier') {
            this.windowReferences.set(node.left.name, true);
            return;
        }

        // Track 'message' assignment expressions: x = 'message'/"message"/`message`
        if (node.type == 'AssignmentExpression' && 
            node.right && 
            node.left && 
            node.left.type == 'Identifier') {
            
            // String literal: x = 'message' or x = "message"
            if (node.right.type == 'Literal' && node.right.value == 'message') {
                this.messageVariables.set(node.left.name, 'message');
                return;
            }
            
            // Template literal: x = `message`
            if (node.right.type == 'TemplateLiteral' && 
                node.right.expressions && 
                node.right.expressions.length == 0 &&
                node.right.quasis && 
                node.right.quasis.length == 1 &&
                node.right.quasis[0].value &&
                node.right.quasis[0].value.cooked == 'message') {
                this.messageVariables.set(node.left.name, 'message');
                return;
            }
        }

        // Track 'onmessage' assignment expressions: x = 'onmessage'/"onmessage"/`onmessage`
        if (node.type == 'AssignmentExpression' && 
            node.right && 
            node.left && 
            node.left.type == 'Identifier') {
            
            // String literal: x = 'onmessage' or x = "onmessage"
            if (node.right.type == 'Literal' && node.right.value == 'onmessage') {
                this.onmessageVariables.set(node.left.name, 'onmessage');
                return;
            }
            
            // Template literal: x = `onmessage`
            if (node.right.type == 'TemplateLiteral' && 
                node.right.expressions && 
                node.right.expressions.length == 0 &&
                node.right.quasis && 
                node.right.quasis.length == 1 &&
                node.right.quasis[0].value &&
                node.right.quasis[0].value.cooked == 'onmessage') {
                this.onmessageVariables.set(node.left.name, 'onmessage');
                return;
            }
        }
    }

    _connectBinaryExpression(node) {
        if (!node) return null;
        
        if (node.type == 'Literal' && typeof node.value == 'string') {
            return node.value;
        }
        
        if (node.type == 'BinaryExpression' && node.operator == '+') {
            const leftValue = this._connectBinaryExpression(node.left);
            const rightValue = this._connectBinaryExpression(node.right);
            
            if (leftValue !== null && rightValue !== null) {
                return leftValue + rightValue;
            }
        }
        
        return null;
    }
}

module.exports = { MessageExtractor };