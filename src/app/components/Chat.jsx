"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaUser } from "react-icons/fa"; // Icons für Bot und User
import { IoChatbubbleEllipsesOutline } from "react-icons/io5"; // Neues Icon für minimiertes Widget
import axios from "axios";

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const chatContainerRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const newMessage = {
      sender: "user",
      content: inputValue,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue("");

    const botMessage = {
      sender: "bot",
      content: "Ich programmiere mich gerade, um später Ihnen helfen zu können!",
    };

    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1000);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50 transation-200">
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="flex items-center justify-center w-12 h-12 bg-[#b29d88] text-white rounded-full shadow-lg hover:bg-[#a08a76] focus:outline-none focus:ring-2 focus:ring-[#b29d88]"
          aria-label="Chat öffnen"
        >
          <IoChatbubbleEllipsesOutline size={24} />
        </button>
      )}

      {isOpen && (
        <div className="w-80 h-[500px] bg-white rounded-lg shadow-lg flex flex-col">
          <header className="flex items-center justify-between p-4 bg-[#b29d88] text-white rounded-t-lg">
            <h2 className="text-lg font-semibold">Chat</h2>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 focus:outline-none p-2 sm:p-3 rounded-full bg-[#b29d88] hover:bg-[#a08a76] transition-all duration-300"
              aria-label="Chat schließen"
            >
              ✕
            </button>
          </header>

          <div
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            ref={chatContainerRef}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <FaRobot className="w-6 h-6 text-[#b29d88] mr-2" />
                )}
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-[#b29d88] text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
                {message.sender === "user" && (
                  <FaUser className="w-6 h-6 text-[#b29d88] ml-2" />
                )}
              </div>
            ))}
          </div>

          <div className="p-3 border-t bg-white w-full">
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full">
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
      placeholder="Nachricht eingeben..."
      className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b29d88]"
    />
    <button
      onClick={handleSendMessage}
      className="px-4 py-2 bg-[#b29d88] text-white rounded-lg hover:bg-[#a08a76] focus:outline-none focus:ring-2 focus:ring-[#b29d88] text-sm transition-all duration-200"
    >
      Senden
    </button>
  </div>


          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
