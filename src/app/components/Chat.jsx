"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaUser } from "react-icons/fa"; // Icons für Bot und User
import { IoChatbubbleEllipsesOutline } from "react-icons/io5"; // Neues Icon für minimiertes Widget
import axios from "axios";

const Chat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const chatContainerRef = useRef(null);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = async () => {
        if (input.trim()) {
            const userMessage = { text: input, sender: "user" };
            setMessages((prev) => [...prev, userMessage]);
            setInput("");

            try {
                // Anfrage an die API senden
                const res = await axios.post("/api/chat", { message: input });

                // Antwort in der Konsole ausgeben
                console.log(res.data.reply);

                // Bot-Nachricht hinzufügen
                const botMessage = { text: res.data.reply, sender: "bot" };
                setMessages((prev) => [...prev, botMessage]);
            } catch (error) {
                console.error("Fehler beim Senden der Nachricht:", error);

                // Fehlernachricht vom Bot anzeigen
                const botMessage = { text: "Developers sind dabei mich bereitzustellen 🫶 ", sender: "bot" };
                setMessages((prev) => [...prev, botMessage]);
            }
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div
            className={`fixed bottom-4 right-4 ${
                isOpen ? "h-96 w-80" : "h-14 w-14"
            } bg-white shadow-lg rounded-lg transition-all duration-300 flex flex-col border border-gray-300`}
            style={{ zIndex: 1000 }}
        >
            {/* Header */}
            <div
                className={`flex items-center justify-between ${
                    isOpen ? "bg-[#5d5247]" : "bg-[#b29d88]"
                } text-white p-3 rounded-t-lg cursor-pointer`}
                onClick={toggleChat}
            >
                {isOpen ? (
                    <span className="font-bold">Chat mit AI</span>
                ) : (
                    <IoChatbubbleEllipsesOutline className="w-6 h-6 mx-auto" />
                )}
                {isOpen && <button className="text-white">–</button>}
            </div>

            {/* Chat-Inhalt */}
            {isOpen && (
                <>
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                    >
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex items-start ${
                                    message.sender === "user" ? "justify-end" : "justify-start"
                                }`}
                            >
                                {message.sender === "bot" && (
                                    <FaRobot className="w-6 h-6 text-[#47525d] mr-2" />
                                )}
                                <div
                                    className={`p-3 rounded-lg max-w-xs ${
                                        message.sender === "user"
                                            ? "bg-[#b29d88] text-white"
                                            : "bg-[#47525d] text-white"
                                    }`}
                                >
                                    {message.text}
                                </div>
                                {message.sender === "user" && (
                                    <FaUser className="w-6 h-6 text-[#b29d88] ml-2" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Eingabefeld */}
                    <div className="p-3 border-t bg-white">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b29d88]"
                            placeholder="Nachricht eingeben..."
                        />
                        <button
                            onClick={handleSend}
                            className="mt-2 w-full bg-[#5d5247] text-white p-2 rounded-lg hover:bg-[#47525d] transition"
                        >
                            Senden
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Chat;
