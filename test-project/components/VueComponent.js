/**
 * Vue.js component with message handling patterns
 */

// Vue component with message listeners
const MessageComponent = {
    template: `
        <div>
            <h3>Vue Message Component</h3>
            <div id="vue-messages">{{ messages.join(', ') }}</div>
        </div>
    `,
    
    data() {
        return {
            messages: []
        };
    },
    
    mounted() {
        // Vue component message listener
        window.addEventListener('message', this.handleMessage);
        document.addEventListener('message', this.handleDocumentMessage);
        
        // VULNERABLE: onmessage assignment in Vue
        window.onmessage = (event) => {
            // VULNERABLE: Vue reactive data with unvalidated input
            this.messages.push(event.data);
            
            // VULNERABLE: eval in Vue component
            if (event.data.vueCode) {
                eval(event.data.vueCode);
            }
        };
    },
    
    beforeUnmount() {
        window.removeEventListener('message', this.handleMessage);
        document.removeEventListener('message', this.handleDocumentMessage);
        window.onmessage = null;
    },
    
    methods: {
        handleMessage(event) {
            // VULNERABLE: No origin validation in Vue
            console.log('Vue component received:', event.data);
            
            // VULNERABLE: Direct DOM manipulation in Vue
            if (event.data.html) {
                document.getElementById('vue-messages').innerHTML = event.data.html;
            }
            
            // VULNERABLE: Dynamic method execution
            if (event.data.method && this[event.data.method]) {
                this[event.data.method](event.data.args);
            }
        },
        
        handleDocumentMessage(event) {
            // VULNERABLE: Vue $set with user data
            if (event.data.vueData) {
                Object.assign(this.$data, event.data.vueData);
            }
        },
        
        // VULNERABLE: Method that can be called via messages
        executeVueScript(script) {
            eval(script);
        },
        
        updateVueDOM(selector, content) {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = content;
            }
        }
    }
};

// Vue mixin with message handling
const MessageMixin = {
    mounted() {
        // Mixin message listener
        window.addEventListener('message', this.mixinMessageHandler);
    },
    
    beforeUnmount() {
        window.removeEventListener('message', this.mixinMessageHandler);
    },
    
    methods: {
        mixinMessageHandler(event) {
            // VULNERABLE: Mixin with eval
            if (event.data.mixinCode) {
                eval(event.data.mixinCode);
            }
        }
    }
};

// Vue directive with message handling
const messageDirective = {
    mounted(el, binding) {
        // VULNERABLE: Directive message listener
        window.addEventListener('message', function(event) {
            if (event.data.directive === binding.arg) {
                // VULNERABLE: Element manipulation via directive
                el.innerHTML = event.data.content;
            }
        });
    }
};

// Vue composition API with message handling
function useMessageHandling() {
    const { ref, onMounted, onUnmounted } = Vue;
    const messages = ref([]);
    
    const handleMessage = (event) => {
        // VULNERABLE: Composition API with unvalidated data
        messages.value.push(event.data);
        
        // VULNERABLE: eval in composition function
        if (event.data.compositionCode) {
            eval(event.data.compositionCode);
        }
    };
    
    onMounted(() => {
        window.addEventListener('message', handleMessage);
        document.addEventListener('message', handleMessage);
    });
    
    onUnmounted(() => {
        window.removeEventListener('message', handleMessage);
        document.removeEventListener('message', handleMessage);
    });
    
    return { messages };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        MessageComponent, 
        MessageMixin, 
        messageDirective, 
        useMessageHandling 
    };
}