import React, { useState, useEffect, useRef } from 'react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const messagesEndRef = useRef(null);

  // 1. FAQ Data - Customized for website understanding
  const faqData = [
    {
      question: 'What is this platform?',
      answer: 'Civix is a community engagement platform designed to connect citizens with local authorities. We help you report infrastructure issues and track their resolution.'
    },
    {
      question: 'How do I report an issue?',
      answer: 'Click the "Report Issue" button on the homepage. You will need to provide a description, location, and optionally upload a photo.'
    },
    {
      question: 'How can I track my reported issue?',
      answer: 'Go to "My Reports" in your profile. Each issue shows a status: Open, In Progress, or Resolved.'
    },
    {
      question: 'What types of issues can I report?',
      answer: 'You can report potholes, broken streetlights, garbage collection problems, water leaks, and other public infrastructure issues.'
    },
    {
      question: 'Who sees my reports?',
      answer: 'Reports are visible to city administrators and community members. Your personal contact info remains private.'
    }
  ];

  // 2. Initialize Chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          text: "Hi! I'm the Civix Guide. I can help you understand how this website works. What would you like to know?",
          isBot: true
        }
      ]);
      setSuggestedQuestions(faqData.map(item => item.question).slice(0, 4));
    }
  }, [isOpen]);

  // 3. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // User Message
    const newMessages = [...messages, { text: inputValue, isBot: false }];
    setMessages(newMessages);
    setInputValue('');
    setSuggestedQuestions([]); // Clear suggestions on manual type

    // Bot Response Logic
    setTimeout(() => {
      const matchedFaq = faqData.find(item => 
        item.question.toLowerCase().includes(inputValue.toLowerCase()) || 
        inputValue.toLowerCase().includes(item.question.toLowerCase())
      );

      if (matchedFaq) {
        setMessages(prev => [...prev, { text: matchedFaq.answer, isBot: true }]);
      } else {
        setMessages(prev => [...prev, { 
          text: "I'm not sure I understand specific details yet. Try asking one of these common questions:", 
          isBot: true 
        }]);
        setSuggestedQuestions(faqData.map(item => item.question).slice(0, 3));
      }
    }, 800);
  };

  const handleSuggestedQuestion = (question) => {
    // Add user selection immediately
    const newMessages = [...messages, { text: question, isBot: false }];
    setMessages(newMessages);
    
    // Find answer
    setTimeout(() => {
      const matchedFaq = faqData.find(item => item.question === question);
      if (matchedFaq) {
        setMessages(prev => [...prev, { text: matchedFaq.answer, isBot: true }]);
      }
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen ? (
        <div className="w-80 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-bold tracking-wide">Civix Assistant</h3>
            </div>
            <button onClick={toggleChat} className="text-white hover:bg-blue-700 p-1 rounded transition">
              {/* Close Icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    message.isBot ? 
                    'bg-white text-gray-800 rounded-tl-none border border-gray-100' : 
                    'bg-blue-600 text-white rounded-br-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {/* Suggestions Chips */}
            {suggestedQuestions.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-xs text-gray-400 ml-1">Suggested topics:</p>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-left text-xs bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition duration-200 shadow-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a question..."
                className="flex-1 p-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-4"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-sm"
              >
                {/* Send Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Floating Button */
        <button
          onClick={toggleChat}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition duration-300 transform hover:scale-105 flex items-center justify-center group"
        >
          {/* Message Icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-bounce"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
      )}
    </div>
  );
};

export default ChatBot;