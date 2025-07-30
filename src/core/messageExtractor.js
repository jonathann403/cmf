class MessageExtractor {
    constructor(astParser) {
        this.astParser = astParser;
        this.objectsReferences = new Map(); // Track variables assigned to different types of objects
        this.objects = [
            'window',
            'self',
            'worker',
            'iframe.contentWindow',
            'websocket',
            'eventSource',
            'messagePort',
            'broadcastChannel',
            'serviceWorker'
        ];
    }

    extractMessageListeners(ast) {
        const messageListeners = [];
        
        // Reset object references for each AST
        this.objectsReferences.clear();
        
        this.astParser.traverse(ast, {
            VariableDeclarator: (path) => {
                this._trackObjectAssignment(path.node); // refs check
            },
            AssignmentExpression: (path) => {
                // Track window assignments first
                this._trackObjectAssignment(path.node); // refs check
                
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
        // Direct
        if (this._isObjectMessageListener(node)) {
            const target = this._getObjectType(node.callee.object);
            return {
                type: 'addEventListener',
                handler: node.arguments[1],
                line: this._getLineNumber(node),
                target: target
            };
        }
        
        // Reference    *may add a boolean field of "Referenced"
        if (this._isObjectReferenceMessageListener(node)) {
            const target = this.objectsReferences.get(node.callee.object.name);
            return {
                type: 'addEventListener',
                handler: node.arguments[1],
                line: this._getLineNumber(node),
                target: target
            };
        }
        
        return null;
    }

    _extractOnMessageListener(node) {
        // Direct
        if (this._isObjectOnMessage(node)) {
            const target = this._getObjectType(node.left.object);
            return {
                type: 'onmessage',
                handler: node.right,
                line: this._getLineNumber(node),
                target: target
            };
        }
        
        // Reference    *may add a boolean field of "Referenced"
        if (this._isObjectReferenceOnMessage(node)) {
            const target = this.objectsReferences.get(node.left.object.name);
            return {
                type: 'onmessage',
                handler: node.right,
                line: this._getLineNumber(node),
                target: target
            };
        }
        
        return null;
    }


    // Form check
    _isObjectMessageListener(node) {
        return node.callee.type == 'MemberExpression' &&
               node.callee.property.name == 'addEventListener' &&
               node.arguments.length >= 2 &&
               (node.arguments[0].type == 'StringLiteral' || node.arguments[0].type == 'Literal') &&
               node.arguments[0].value == 'message' &&
               this._getObjectType(node.callee.object) != null;
    }

    _isObjectReferenceMessageListener(node) {
        return node.callee.type == 'MemberExpression' &&
               node.callee.property.name == 'addEventListener' &&
               node.callee.object.type == 'Identifier' &&
               node.arguments.length >= 2 &&
               (node.arguments[0].type == 'StringLiteral' || node.arguments[0].type == 'Literal') &&
               node.arguments[0].value == 'message'&&
               this.objectsReferences.has(node.callee.object.name);
    }

    _isObjectOnMessage(node) {
        return node.left.type == 'MemberExpression' &&
               node.left.property.name == 'onmessage' &&
               this._getObjectType(node.left.object) != null;
    }

    _isObjectReferenceOnMessage(node) {
        return node.left.type == 'MemberExpression' &&
               node.left.property.name == 'onmessage' &&
               node.left.object.type == 'Identifier' &&
               this.objectsReferences.has(node.left.object.name);
    }

    _trackObjectAssignment(node) {
        let varName = null;
        let objectType = null;
        // Track variable declarations: const x = window; let y = window; var z = window;
        if (node.type == 'VariableDeclarator' && node.id && node.id.type == 'Identifier') {
            varName = node.id.name;
            objectType = this._getObjectType(node.init);
        } 
        // Track assignment expressions: x = window;
        else if (node.type == 'AssignmentExpression' && node.left && node.left.type == 'Identifier') {
            varName = node.left.name;
            objectType = this._getObjectType(node.right);
        }
        
        // Setting
        if (varName && objectType) {
            this.objectsReferences.set(varName, objectType);
        }
    }

    _getObjectType(node) {
        if (!node) return null;
        
        if (node.type == 'Identifier') {
            if (node.name == 'window') return 'window';
            if (node.name == 'self') return 'self';
        }
        
        if (node.type == 'MemberExpression') {
            if (node.property.name == 'contentWindow') {
                return 'iframe.contentWindow';
            }
            if (node.object && node.object.name == 'navigator' && 
                node.property.name == 'serviceWorker') {
                return 'serviceWorker';
            }
            if (node.property.name == 'port1' || node.property.name == 'port2' || node.property.name == 'port') {
                return 'messagePort';
            }
        }
        
        if (node.type == 'NewExpression' && node.callee.type == 'Identifier') {
            switch (node.callee.name) {
                case 'Worker':
                case 'SharedWorker':
                    return 'worker';
                case 'WebSocket':
                    return 'websocket';
                case 'EventSource':
                    return 'eventSource';
                case 'BroadcastChannel':
                    return 'broadcastChannel';
                case 'MessageChannel':
                    return 'messagePort';
                default:
                    return null;
            }
        }
        
        if (node.type == 'CallExpression' && node.callee.type == 'MemberExpression') {
            if (node.callee.object && node.callee.object.name == 'window' &&
                node.callee.property.name == 'open') {
                return 'window';
            }
        }
        
        return null;
    }

    _getLineNumber(node) {
        return node.loc ? node.loc.start.line : 0;
    }
}

module.exports = { MessageExtractor };