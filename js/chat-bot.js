const responses = {
    "Product Design Experience": {
      text: "I have 10 years of experience crafting complex multi-sided products, combining strategic design thinking with technical prototyping expertise. I've worked on projects for companies like Uber, Meta, and Amplify, focusing on creating scalable solutions that drive impact.",
      followUp: [
        "Tell me about a specific project at Uber",
        "How do you approach complex design problems?",
        "What design systems have you worked with?"
      ]
    },
    "Technical Skills": {
      text: "I possess strong technical skills in design systems, animation, and coding (CSS, JavaScript, React). I've created interactive prototypes, animated avatar systems, and innovative UI patterns. I also have experience with physical computing using Arduino.",
      followUp: [
        "Tell me about your animation projects",
        "What's your prototyping process?",
        "Show me some technical projects"
      ]
    },
    "Recent Projects": {
      text: "Some of my recent projects include redesigning the agent discovery experience on Zillow, setting up merchants for success on Uber Eats globally, and creating interactive educational experiences for children. Which project would you like to know more about?",
      followUp: [
        "Tell me about the Zillow project",
        "Tell me about the educational projects",
        "How do you approach project planning?"
      ]
    },
    "Work Philosophy": {
      text: "I'm driven by the challenge of making complex systems feel simple and accessible. My work focuses on creating scalable solutions that drive impact while ensuring usability for all. I believe in proactive collaboration and detail-oriented, user-centric design.",
      followUp: [
        "How do you collaborate with engineers?",
        "How do you handle user research?",
        "Tell me about a challenging project"
      ]
    }
  };
  
  class ChatInterface {
    constructor() {
      this.messagesContainer = document.getElementById('chatMessages');
      this.chatForm = document.getElementById('chatForm');
      this.chatInput = document.getElementById('chatInput');
      this.messageCount = 0;
      this.selectedOptions = new Set();
  
      this.initialize();
      this.setupEventListeners();
    }
  
    initialize() {
      const initialMessage = {
        type: 'bot',
        content: "Hi! I'm Lauren's AI assistant. <br>I’ll tell you about her based on her resume, case study, reference, and peer reviews. What do you like to learn about Lauren?",
        options: [
          "Product Design Experience",
          "Technical Skills",
          "Recent Projects",
          "Work Philosophy"
        ]
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
  
      requestAnimationFrame(() => {
        const container = this.messagesContainer;
        const containerHeight = container.clientHeight;
        const scrollPosition = messageElement.offsetTop - 24;
        
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      });
  
      return messageId;
    }
  
    handleOptionClick(e) {
      const button = e.currentTarget;
      const messageId = button.dataset.messageId;
      const option = button.dataset.option;
      const optionKey = `${messageId}-${option}`;
  
      if (this.selectedOptions.has(optionKey)) return;
  
      this.selectedOptions.add(optionKey);
      button.classList.add('selected');
  
      const response = responses[option] || {
        text: responses["Product Design Experience"].text,
        followUp: responses["Product Design Experience"].followUp
      };
  
      const userMessageId = this.addMessage({ type: 'user', content: option });
      
      setTimeout(() => {
        this.addMessage({
          type: 'bot',
          content: response.text,
          options: response.followUp
        });
      }, 100);
    }
  
    handleSubmit(e) {
      e.preventDefault();
      const userInput = this.chatInput.value.trim();
      if (!userInput) return;
  
      this.chatInput.value = '';
      
      const userMessageId = this.addMessage({ type: 'user', content: userInput });
      
      setTimeout(() => {
        this.addMessage({
          type: 'bot',
          content: "Here's what I can tell you about that:",
          options: Object.keys(responses)
        });
      }, 100);
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    window.chatInterface = new ChatInterface();
  });


  