import { useState, useEffect, useRef } from "react";
import { askChatbot } from "../../services/chatbot";

type Message = {
  text: string;
  sender: "user" | "bot";
};

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Welcome to OLMS! How can we help you?",
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto scroll ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      sender: "user",
    };

    // Show user message instantly
    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setLoading(true);

    const res = await askChatbot(input);
    const text = res.status === 200 ? res.data.reply || "No response" : res.data.message || "Failed to get response";
    setMessages((prev) => [...prev, { text, sender: "bot" }]);
    setLoading(false);
  };

  return (
    <div
      style={{
        width: "min(420px, calc(100vw - 32px))",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        background: "#fff",
        border: "1px solid #e5e5e5",
        display: "flex",
        flexDirection: "column",
        height: "min(500px, calc(100dvh - 120px))",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#111827",
          color: "white",
          padding: "16px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        OLMS AI Assistant
      </div>

      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          background: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent:
                msg.sender === "user"
                  ? "flex-end"
                  : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "12px 16px",
                borderRadius: "18px",
                fontSize: "15px",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background:
                  msg.sender === "user"
                    ? "#2563eb"
                    : "#ffffff",
                color:
                  msg.sender === "user"
                    ? "#ffffff"
                    : "#111827",
                border:
                  msg.sender === "bot"
                    ? "1px solid #e5e7eb"
                    : "none",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                padding: "12px 16px",
                borderRadius: "18px",
                border: "1px solid #e5e7eb",
                color: "#555",
                fontSize: "14px",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              🤖 AI is typing...
            </div>
          </div>
        )}

        {/* Auto Scroll Target */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "14px",
          borderTop: "1px solid #e5e7eb",
          background: "#fff",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && sendMessage()
          }
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid #d1d5db",
            outline: "none",
            fontSize: "14px",
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: "12px 18px",
            borderRadius: "12px",
            border: "none",
            background: loading
              ? "#93c5fd"
              : "#2563eb",
            color: "white",
            cursor: loading
              ? "not-allowed"
              : "pointer",
            fontWeight: "bold",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}