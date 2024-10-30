// responses.js
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

// Also export the initial options that should be shown
export const initialOptions = [
    "🚀 Where has Lauren made an impact?",
    "🧠 How does Lauren approach design challenges?",
    "🤝 What do teams say about Lauren?",
    "🤖 Curious about this AI assistant"
];

export default responses;