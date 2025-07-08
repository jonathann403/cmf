/**
 * React TypeScript component with message handling
 */

import React, { useEffect, useState } from 'react';

interface MessageData {
    type: string;
    payload: any;
    timestamp: number;
}

const MessageComponent: React.FC = () => {
    const [messages, setMessages] = useState<MessageData[]>([]);

    useEffect(() => {
        // React component message listener
        const handleMessage = (event: MessageEvent) => {
            // VULNERABLE: No origin validation in React component
            console.log('React component received message:', event.data);
            
            // VULNERABLE: State update with unvalidated data
            setMessages(prev => [...prev, {
                type: event.data.type,
                payload: event.data.payload,
                timestamp: Date.now()
            }]);
            
            // VULNERABLE: Direct DOM manipulation in React
            if (event.data.html) {
                const container = document.getElementById('react-messages');
                if (container) {
                    container.innerHTML = event.data.html;
                }
            }
        };

        // Multiple ways to add listeners in React
        window.addEventListener('message', handleMessage);
        document.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
            document.removeEventListener('message', handleMessage);
        };
    }, []);

    // Another useEffect with message listener
    useEffect(() => {
        // VULNERABLE: Arrow function message handler
        const messageHandler = (event: MessageEvent) => {
            // VULNERABLE: eval in React component
            if (event.data.execute) {
                eval(event.data.execute);
            }
        };

        window.addEventListener('message', messageHandler);
        
        return () => window.removeEventListener('message', messageHandler);
    }, []);

    return (
        <div>
            <h3>Message Component</h3>
            <div id="react-messages"></div>
            {messages.map((msg, index) => (
                <div key={index}>
                    <span>{msg.type}: {JSON.stringify(msg.payload)}</span>
                </div>
            ))}
        </div>
    );
};

// Class component with message handling
class LegacyMessageComponent extends React.Component {
    componentDidMount() {
        // VULNERABLE: Class component message listener
        window.addEventListener('message', this.handleMessage);
        window.onmessage = this.handleLegacyMessage;
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.handleMessage);
        window.onmessage = null;
    }

    handleMessage = (event: MessageEvent) => {
        // VULNERABLE: setState with unvalidated data
        this.setState({ lastMessage: event.data });
        
        // VULNERABLE: Direct script injection
        if (event.data.script) {
            const script = document.createElement('script');
            script.textContent = event.data.script;
            document.head.appendChild(script);
        }
    };

    handleLegacyMessage = (event: MessageEvent) => {
        // VULNERABLE: Location manipulation
        if (event.data.redirect) {
            window.location.href = event.data.redirect;
        }
    };

    render() {
        return <div>Legacy Message Component</div>;
    }
}

export { MessageComponent, LegacyMessageComponent };