// Import configurations and contexts
import CONFIG from './ai_context/config.js';
import PERSONAL_CONTEXT from './ai_context/personalContext.js';
import responses, { initialOptions } from './ai_context/responses.js';


class ChatInterface {
    
    constructor() {

        this.isProduction = window.location.hostname.includes('github.io');
        if (this.isProduction && (!CONFIG || !CONFIG.ANTHROPIC_API_KEY)) {
            console.error('Production configuration missing');
            return;
        }

        // Initialize DOM elements
        this.chatInterface = document.querySelector('.chat-interface');
        this.messagesContainer = document.querySelector('.messages-container');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatForm = document.querySelector('.input-form');
        this.chatInput = document.querySelector('.chat-input');
        this.sendButton = document.querySelector('.send-button');
        
        // Initialize state
        this.messageCount = 0;
        this.selectedOptions = new Set();
        this.isProcessing = false;
        this.conversationHistory = [];
        this.rateLimitTimer = null;
        this.messageQueue = [];
        this.typingTimeout = null;
        this.isLimitReached = false;
        
        // Configuration
        this.MAX_REQUESTS_PER_MINUTE = 5;
        this.MAX_MESSAGES = 10;
        this.typingSpeed = 25; // ms per character
        this.MAX_MESSAGE_LENGTH = 500;
        this.MIN_MESSAGE_LENGTH = 2;
        
        // Final message content
        this.LIMIT_MESSAGE = `Thank you for your interest in Lauren's work! I've reached my message limit, but please explore the rest of the portfolio. Get in touch with Lauren directly: heylaurenwang@gmail.com`;


        // Validate required elements
        if (!this.chatMessages || !this.chatForm || !this.chatInput) {
            console.error('Required DOM elements not found');
            return;
        }

        // Initialize chat
        this.setupAccessibility();
        this.initialize();
        this.setupEventListeners();
        this.createLoadingIndicator();
        this.initializeStyles();


        // Add analytics configuration
        this.analyticsConfig = {
            chatStarted: false,
            messageCount: 0,
            sessionStartTime: null,
            lastInteractionTime: null
        };

        // Initialize analytics tracking
        this.initializeAnalytics();

        // Verify config exists
        if (!CONFIG || !CONFIG.ANTHROPIC_API_KEY) {
            console.error('API configuration is missing');
            this.handleError(new Error('Configuration missing'));
            return;
        }
    }

    initializeAnalytics() {
        // Check if GA4 is available
        if (typeof gtag === 'undefined') {
            console.warn('Google Analytics not loaded');
            return;
        }

        // Track chat widget initialization
        this.trackEvent('chat_initialize', {
            event_category: 'Chat',
            event_label: 'Chat Widget Loaded'
        });
    }

    trackEvent(eventName, params = {}) {
        if (typeof gtag === 'undefined') return;

        // Add common parameters
        const eventParams = {
            ...params,
            timestamp: new Date().toISOString(),
            chat_session_id: Date.now().toString(),
            // Add any other common parameters you want to track
        };

        // Send event to GA4
        gtag('event', eventName, eventParams);
    }


    initializeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .contact-link {
                color: #1a73e8;
                text-decoration: none;
                font-weight: 500;
            }
            .contact-link:hover {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
    }

    setupAccessibility() {
        this.chatInterface.setAttribute('role', 'region');
        this.chatInterface.setAttribute('aria-label', 'Chat conversation');
        this.chatMessages.setAttribute('role', 'log');
        this.chatMessages.setAttribute('aria-live', 'polite');
        this.chatInput.setAttribute('aria-label', 'Type your message');
        this.sendButton.setAttribute('aria-label', 'Send message');
    }

    initialize() {
        const initialMessage = {
            type: 'bot',
            content: "👋 I'm Lauren's AI assistant, designed to help you learn about her professionally. I draw from her actual work history, peer reviews, and case studies to provide authentic insights. Ask your own question or pick one below👇",
            options: initialOptions
        };
        this.addMessage(initialMessage);
    }

    setupEventListeners() {
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.chatInput.addEventListener('input', () => this.handleInputChange());
        
        // Add keyboard navigation for options
        this.chatMessages.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('option-button')) {
                e.target.click();
            }
        });
    }

    
    handleInputChange() {
        const inputLength = this.chatInput.value.length;
        if (inputLength > this.MAX_MESSAGE_LENGTH) {
            this.chatInput.value = this.chatInput.value.slice(0, this.MAX_MESSAGE_LENGTH);
        }
        
        this.sendButton.disabled = inputLength < this.MIN_MESSAGE_LENGTH || this.isLimitReached;
    }


    // Add a helper method to remove emojis
    removeEmoji(text) {
        return text
            // Remove emoji and whitespace at start of string
            .replace(/^(?:\p{Emoji}\s*)+/gu, '')
            // In case there are other emojis in the text
            .replace(/\p{Emoji}/gu, '')
            .trim();
    }

    createLoadingIndicator() {
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'typing-indicator';
        this.loadingIndicator.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        this.loadingIndicator.setAttribute('aria-label', 'Assistant is typing');
        this.loadingIndicator.setAttribute('role', 'status');
    }

    showLoading() {
        const existingIndicator = this.chatMessages.querySelector('.typing-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        this.chatMessages.appendChild(this.loadingIndicator);
        this.loadingIndicator.classList.add('visible');
        this.scrollToBottom();
        
        if (this.sendButton) {
            this.sendButton.disabled = true;
            this.sendButton.classList.add('loading');
        }
    }

    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.remove('visible');
            this.loadingIndicator.remove();
        }
        
        if (this.sendButton && !this.isLimitReached) {
            this.sendButton.disabled = false;
            this.sendButton.classList.remove('loading');
        }
    }

    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }

    async animateTyping(messageElement, text, options) {
        const messageText = messageElement.querySelector('.message-text');
        const optionsContainer = messageElement.querySelector('.options-container');
        if (optionsContainer) {
            optionsContainer.style.display = 'none';
        }
        
        messageText.textContent = '';
        this.scrollToBottom();
        
        for (let i = 0; i < text.length; i++) {
            await new Promise(resolve => {
                this.typingTimeout = setTimeout(() => {
                    messageText.textContent += text[i];
                    if (i % 30 === 0) {
                        this.scrollToBottom();
                    }
                    resolve();
                }, this.typingSpeed);
            });
        }

        // Show options after typing animation completes if not reached limit
        if (optionsContainer && !this.isLimitReached) {
            optionsContainer.style.display = 'flex';
            this.scrollToBottom();
        }
    }

    pruneOldMessages() {
        // If limit already reached, don't proceed
        if (this.isLimitReached) return;

        // Check if we've reached the message limit
        if (this.conversationHistory.length >= this.MAX_MESSAGES) {
            this.isLimitReached = true;
            
            // Disable input
            if (this.chatInput) {
                this.chatInput.disabled = true;
                this.chatInput.placeholder = "Message limit reached";
            }
            if (this.sendButton) {
                this.sendButton.disabled = true;
            }

            // Disable all option buttons but keep them visible
            this.chatMessages.querySelectorAll('.option-button').forEach(button => {
                button.disabled = true;
                button.style.cursor = 'default';
                button.classList.add('disabled');
            });

            // Add final message
            this.addMessage({
                type: 'bot',
                content: this.LIMIT_MESSAGE,
                options: [] // No options for final message
            });

            return;
        }

        // If not reached limit yet, continue with normal conversation
        while (this.conversationHistory.length > this.MAX_MESSAGES) {
            this.conversationHistory.shift();
            const oldestMessage = this.chatMessages.firstElementChild;
            if (oldestMessage) {
                oldestMessage.remove();
            }
        }


        // Track when conversation limit is reached
        if (this.isLimitReached) {
            this.trackEvent('conversation_complete', {
                event_category: 'Chat',
                event_label: 'Message Limit Reached',
                total_messages: this.analyticsConfig.messageCount,
                session_duration: Date.now() - this.analyticsConfig.sessionStartTime,
                last_interaction_time: this.analyticsConfig.lastInteractionTime
            });
        }
    }


    // Add engagement tracking
    setupEngagementTracking() {
        // Track when user starts typing
        this.chatInput.addEventListener('focus', () => {
            this.trackEvent('input_focus', {
                event_category: 'Chat',
                event_label: 'Input Focused'
            });
        });

        // Track scroll behavior
        let scrollTimeout;
        this.chatMessages.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackEvent('message_scroll', {
                    event_category: 'Chat',
                    event_label: 'Messages Scrolled',
                    scroll_position: this.chatMessages.scrollTop,
                    scroll_height: this.chatMessages.scrollHeight
                });
            }, 500); // Debounce scroll events
        });

        // Track chat visibility
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.trackEvent('chat_visible', {
                            event_category: 'Chat',
                            event_label: 'Chat Visible',
                            visibility_ratio: entry.intersectionRatio
                        });
                    }
                });
            },
            { threshold: [0, 0.5, 1] }
        );
        observer.observe(this.chatInterface);
    }

    addMessage(message) {
        if (this.isLimitReached && message.content !== this.LIMIT_MESSAGE) {
            return;
        }

        this.pruneOldMessages();
        
        if (this.isLimitReached && message.content !== this.LIMIT_MESSAGE) {
            return;
        }

        this.messageCount++;
        const messageId = this.messageCount;
        const messageElement = document.createElement('div');
        messageElement.id = `message-${messageId}`;
        messageElement.className = 'message-wrapper';

        if (message.type === 'user') {
            this.conversationHistory.push({ 
                role: 'user', 
                content: message.content // Store full message
            });
        } else if (message.type === 'bot') {
            this.conversationHistory.push({ role: 'assistant', content: message.content });
        }

        if (message.type === 'bot') {
            messageElement.innerHTML = `
                <div class="bot-message">
                    <div class="avatar" role="img" aria-label="Assistant avatar">L</div>
                    <div class="message-content">
                        <div class="message-text"></div>
                    </div>
                </div>
                ${message.options ? `
                    <div class="options-container" role="group" aria-label="Response options">
                        ${message.options.map((option, index) => {
                            const [emoji, ...textParts] = option.split(' ');
                            const text = textParts.join(' ');
                            return `
                                <button class="option-button ${this.isLimitReached ? 'disabled' : ''}" 
                                    data-message-id="${messageId}" 
                                    data-option="${option}"
                                    tabindex="0"
                                    role="button"
                                    aria-label="${text}"
                                    ${this.isLimitReached ? 'disabled' : ''}>
                                    <span class="option-emoji" aria-hidden="true">${emoji}</span>
                                    <span class="option-text">${text}</span>
                                </button>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            `;

            this.chatMessages.appendChild(messageElement);
            this.animateTyping(messageElement, message.content, message.options);
        } else {
            const cleanContent = message.content.replace(/^\S+\s/, '');
            messageElement.innerHTML = `
                <div class="user-message">
                    <div class="user-content">${message.content}</div>
                </div>
            `;
            
            this.chatMessages.appendChild(messageElement);
            this.scrollToBottom();
        }

        if (message.options && !this.isLimitReached) {
            messageElement.querySelectorAll('.option-button').forEach(button => {
                button.addEventListener('click', (e) => this.handleOptionClick(e));
            });
        }

        return messageId;
    }

    async handleOptionClick(e) {
        if (this.isProcessing || this.isLimitReached) return;

        const button = e.currentTarget;
        const messageId = button.dataset.messageId;
        const option = button.dataset.option;
        const optionKey = `${messageId}-${option}`;

        if (this.selectedOptions.has(optionKey)) return;


        // Track first message if chat hasn't started
        if (!this.analyticsConfig.chatStarted) {
            this.analyticsConfig.chatStarted = true;
            this.analyticsConfig.sessionStartTime = Date.now();
            this.trackEvent('chat_start', {
                event_category: 'Chat',
                event_label: 'First option clicked',
                first_message: userInput.slice(0, 100) // First 100 chars for privacy
            });
        }

         // Track option click
         this.trackEvent('option_click', {
            event_category: 'Chat',
            event_label: 'Follow-up Selected',
            option_text: option,
            message_id: messageId,
            session_duration: Date.now() - this.analyticsConfig.sessionStartTime
        });


        try {
            this.isProcessing = true;
            button.disabled = true;
            this.selectedOptions.add(optionKey);
            button.classList.add('selected');

             // Remove emoji and send clean text to both UI and API
             const cleanOption = this.removeEmoji(option);
             this.addMessage({ type: 'user', content: cleanOption });
             this.showLoading();
            
            const { response, followUps } = await this.getAIResponse(option);
            
            this.hideLoading();
            this.addMessage({
                type: 'bot',
                content: response,
                options: followUps
            });
        } catch (error) {
            console.error('AI Response Error:', error);
            this.handleError(error);

            this.trackEvent('chat_error', {
                event_category: 'Chat',
                event_label: 'Option Click Error',
                error_type: error.name,
                error_message: error.message
            })

        } finally {
            this.isProcessing = false;
            button.disabled = false;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (this.isProcessing || this.isLimitReached) return;

        const userInput = this.validateInput(this.chatInput.value);
        if (!userInput) return;

         // Track first message if chat hasn't started
         if (!this.analyticsConfig.chatStarted) {
            this.analyticsConfig.chatStarted = true;
            this.analyticsConfig.sessionStartTime = Date.now();
            this.trackEvent('chat_start', {
                event_category: 'Chat',
                event_label: 'First Message Sent',
                first_message: userInput.slice(0, 100) // First 100 chars for privacy
            });
        }

        try {
            this.isProcessing = true;
            this.chatInput.disabled = true;
            this.chatInput.value = '';

            // Track message sent
            this.analyticsConfig.messageCount++;
            this.analyticsConfig.lastInteractionTime = Date.now();
            this.trackEvent('message_sent', {
                event_category: 'Chat',
                event_label: 'User Message',
                message_count: this.analyticsConfig.messageCount,
                message_length: userInput.length,
                session_duration: Date.now() - this.analyticsConfig.sessionStartTime
            });

            this.addMessage({ type: 'user', content: userInput });
            this.showLoading();
            
            const { response, followUps } = await this.getAIResponse(userInput);
            
            // Track AI response
            this.trackEvent('ai_response', {
                event_category: 'Chat',
                event_label: 'AI Response',
                response_length: response.length,
                has_followups: followUps.length > 0
            });

            this.hideLoading();
            this.addMessage({
                type: 'bot',
                content: response,
                options: followUps
            });
        } catch (error) {

            // Track errors
            this.trackEvent('chat_error', {
                event_category: 'Chat',
                event_label: 'API Error',
                error_type: error.name,
                error_message: error.message
            });

            console.error('AI Response Error:', error);
            this.handleError(error);
        } finally {
            this.isProcessing = false;
            if (!this.isLimitReached) {
                this.chatInput.disabled = false;
                this.chatInput.focus();
            }
        }
    }

    validateInput(input) {
        if (this.isLimitReached) return null;
        
        const trimmed = input.trim();
        if (trimmed.length < this.MIN_MESSAGE_LENGTH) {
            return null;
        }
        if (trimmed.length > this.MAX_MESSAGE_LENGTH) {
            return trimmed.slice(0, this.MAX_MESSAGE_LENGTH);
        }
        return trimmed;
    }

    handleError(error) {
        let errorMessage = "I apologize, but I'm having trouble right now.";
        
        if (error.message.includes('Configuration missing')) {
            errorMessage = "Chat service is currently unavailable. Please try again later.";
        } else if (error.message.includes('429')) {
            errorMessage = "I'm receiving too many requests. Please wait a moment and try again.";
        } else if (error.message.includes('401')) {
            errorMessage = "There seems to be an authentication issue. Lauren would appreciate it if you let her know.";
        }

        this.hideLoading();
        if (!this.isLimitReached) {
            this.addMessage({
                type: 'bot',
                content: errorMessage,
                options: [initialOptions]
            });
        }
    }

    rateLimit() {
        return new Promise(resolve => {
            if (this.rateLimitTimer) {
                this.messageQueue.push(resolve);
            } else {
                this.rateLimitTimer = setTimeout(() => {
                    this.rateLimitTimer = null;
                    const next = this.messageQueue.shift();
                    if (next) next();
                }, (60 * 1000) / this.MAX_REQUESTS_PER_MINUTE);
                resolve();
            }
        });
    }



    
    async getAIResponse(userMessage) {
        if (!CONFIG?.ANTHROPIC_API_KEY) {
            throw new Error('API configuration is missing');
        }
        await this.rateLimit();

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': CONFIG?.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1024,
                    temperature: 0.5,
                    system: `You are Lauren's AI assistant. Use this information about Lauren to answer questions:
                    ${PERSONAL_CONTEXT}
    
                    Respond in this exact format:
                    [RESPONSE]
                    Your main response here...
                    [/RESPONSE]
                    [FOLLOWUPS]
                    1. 👩‍💻 First follow-up question
                    2. 🎨 Second follow-up question
                    3. 💡 Third follow-up question
                    4. 🤯 Fourth follow-up question
                    [/FOLLOWUPS]
                    
                    Keep response friendly and conversational and under 70 words.
                    
                    Generate 4 followup questions, 
                    the followups 1,2,3 should be directly related to the previous response and natually continue the conversation. 
                    the followups 4 should connect the response to a random topic under ${initialOptions}
                    Each followups should:
                    - Start with a relevant emoji that matches the question's topic and provides visual context to the question
                    - Be concise (under 9 words)
                    - be centered around Lauren
                    - address Lauren as third person perspective
                    the emojis for all the followups should be all different from each other
    
                    Example followups:
                    🎯 What specific goals drove this project forward?
                    🤝 How did you collaborate with the engineering team?
                    📊 Which metrics defined success for this work?
    
                    If you're not sure about something, use only the information provided above.`,
                    messages: [
                        ...this.conversationHistory,
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.content[0].text;

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

// Initialize chat interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatInterface = new ChatInterface();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.chatInterface) {
        clearTimeout(window.chatInterface.typingTimeout);
        clearTimeout(window.chatInterface.rateLimitTimer);
    }
});