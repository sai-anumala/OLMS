"use client";
import { useState } from "react";
import chatbot from "../../services/common/chatbot";

type Message = {
  text: string;
  sender: "user" | "bot";
};

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([{ text: "Welcome to OLMS! How can we help you?", sender: "bot" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: "user" };

    // Update UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatbot(input);

      if (res.status === 200) {
        setMessages((prev) => [...prev, (res.message as Message)]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: res.message?.text || "Error: Failed to get response", sender: "bot" },
        ]);
      }
    } finally {
      // Ensure loading state is cleared regardless of success or error
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, width: 400, maxWidth: 400, margin: "auto" }}>
      
      {/* Chat Box */}
      <div
        style={{
          height: "400px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 10,
        }}
      >
        <h5 style={{textAlign:'center',margin:'10px 0px 30px 0px',fontFamily:'italic'}}>OLMS AI Assistant</h5>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              marginBottom: 10,
            }}
          >

            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 10,
                background:
                  msg.sender === "user" ? "#0070f3" : "#e5e5ea",
                color: msg.sender === "user" ? "#000" : "#000",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}

        {/* Loading */}
        {loading && <p>🤖 AI is typing...</p>}
      </div>

      {/* Input */}
      <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading} style={{border:'none',background:'none'}}>
          Send
        </button>
      </div>
    </div>
  );
}