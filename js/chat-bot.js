// import ACONFIG from '../_protected/config.js';
import PERSONAL_CONTEXT from './ai_context/personalContext.js';
// import responses, { initialOptions } from './ai_context/responses.js';


class ChatInterface {
    constructor() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.chatForm = document.getElementById('chatForm');
        this.chatInput = document.getElementById('chatInput');
        this.messageCount = 0;
        this.selectedOptions = new Set();
        this.isProcessing = false;
        this.conversationHistory = [];

        if (!this.messagesContainer || !this.chatForm || !this.chatInput) {
            console.error('Required DOM elements not found');
            return;
        }

        

        this.initialize();
        this.setupEventListeners();
        this.createLoadingIndicator();
    }

    createLoadingIndicator() {
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'typing-indicator';
        this.loadingIndicator.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        // Insert before the options container if it exists, otherwise append to messages
        const firstOptionsContainer = this.messagesContainer.querySelector('.options-container');
        if (firstOptionsContainer) {
            firstOptionsContainer.parentNode.insertBefore(this.loadingIndicator, firstOptionsContainer);
        } else {
            this.messagesContainer.appendChild(this.loadingIndicator);
        }
    }

    showLoading() {
        this.loadingIndicator.classList.add('visible');
        this.scrollToBottom();
    }

    hideLoading() {
        this.loadingIndicator.classList.remove('visible');
    }

    scrollToBottom() {
        requestAnimationFrame(() => {
            const container = this.messagesContainer;
            container.scrollTop = container.scrollHeight;
        });
    }
    
    initialize() {
        const initialMessage = {
            type: 'bot',
            content: "Hi! I'm Lauren's AI assistant. <br>I'll tell you about her based on her experience and work. What would you like to learn about Lauren?",
            options: initialOptions
        };
        this.addMessage(initialMessage);
    }

    setupEventListeners() {
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    addMessage(message) {
        this.messageCount++;
        const messageId = this.messageCount;
        const messageElement = document.createElement('div');
        messageElement.id = `message-${messageId}`;
        messageElement.className = 'message-wrapper';

        if (message.type === 'user') {
            this.conversationHistory.push({ role: 'user', content: message.content });
        } else if (message.type === 'bot') {
            this.conversationHistory.push({ role: 'assistant', content: message.content });
        }

        if (message.type === 'bot') {
            messageElement.innerHTML = `
                <div class="bot-message">
                    <div class="avatar">L</div>
                    <div class="message-content">
                        <div class="message-text">${message.content}</div>
                    </div>
                </div>
                ${message.options ? `
                    <div class="options-container">
                        ${message.options.map(option => `
                            <button class="option-button" data-message-id="${messageId}" data-option="${option}">
                                <span>→</span>
                                <span>${option}</span>
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            `;
        } else if (message.type === 'user') {
            messageElement.innerHTML = `
                <div class="user-message">
                    <div class="user-content">${message.content}</div>
                </div>
            `;
        }

        this.messagesContainer.appendChild(messageElement);

        if (message.options) {
            messageElement.querySelectorAll('.option-button').forEach(button => {
                button.addEventListener('click', (e) => this.handleOptionClick(e));
            });
        }

        this.scrollToBottom();
        return messageId;
    }

    async handleOptionClick(e) {
        if (this.isProcessing) return;

        const button = e.currentTarget;
        const messageId = button.dataset.messageId;
        const option = button.dataset.option;
        const optionKey = `${messageId}-${option}`;

        if (this.selectedOptions.has(optionKey)) return;

        this.selectedOptions.add(optionKey);
        button.classList.add('selected');

        this.addMessage({ type: 'user', content: option });
        
        try {
            this.isProcessing = true;
            button.disabled = true;
            
            const { response, followUps } = await this.getAIResponse(option);
            
            this.addMessage({
                type: 'bot',
                content: response,
                options: followUps
            });
        } catch (error) {
            console.error('AI Response Error:', error);
            this.addMessage({
                type: 'bot',
                content: "I apologize, but I'm having trouble right now. Please try one of these topics:",
                options: initialOptions
            });
        } finally {
            this.isProcessing = false;
            button.disabled = false;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (this.isProcessing) return;

        const userInput = this.chatInput.value.trim();
        if (!userInput) return;

        this.chatInput.value = '';
        this.addMessage({ type: 'user', content: userInput });

        try {
            this.isProcessing = true;
            this.chatInput.disabled = true;
            
            const { response, followUps } = await this.getAIResponse(userInput);
            
            this.addMessage({
                type: 'bot',
                content: response,
                options: followUps
            });
        } catch (error) {
            console.error('AI Response Error:', error);
            this.addMessage({
                type: 'bot',
                content: "I apologize, but I'm having trouble responding right now. Please try one of these topics:",
                options: initialOptions
            });
        } finally {
            this.isProcessing = false;
            this.chatInput.disabled = false;
            this.chatInput.focus();
        }
    }

    async getAIResponse(userMessage) {
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': CONFIG.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'

                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 1024,
                    temperature: 0.5,
                    system: `You are Lauren's AI assistant. Use this information about Lauren to answer questions:
                    ${PERSONAL_CONTEXT}

                    Respond in this exact format:
                    [RESPONSE]
                    Your main response here...
                    [/RESPONSE]
                    [FOLLOWUPS]
                    1. First follow-up question
                    2. Second follow-up question
                    3. Third follow-up question
                    [/FOLLOWUPS]

                    Keep responses friendly and conversational. 
                    Each responses should be under 80 words.
                    Generate 3 natural follow-up questions that continue the conversation.
                    Each follow-up should be concise (under 9 words) and directly related to the previous response.`,
                    messages: [
                        ...this.conversationHistory,
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error Details:', errorData);
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.content[0].text;

            // Parse the response to extract main content and follow-ups
            const responseMatch = aiResponse.match(/\[RESPONSE\]([\s\S]*?)\[\/RESPONSE\]/);
            const followupsMatch = aiResponse.match(/\[FOLLOWUPS\]([\s\S]*?)\[\/FOLLOWUPS\]/);

            const mainResponse = responseMatch ? responseMatch[1].trim() : aiResponse;
            const followUps = followupsMatch 
                ? followupsMatch[1]
                    .trim()
                    .split('\n')
                    .map(q => q.replace(/^\d+\.\s*/, '').trim())
                    .filter(q => q)
                : [];

            return {
                response: mainResponse,
                followUps: followUps.length > 0 ? followUps : initialOptions
            };
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chatInterface = new ChatInterface();
});