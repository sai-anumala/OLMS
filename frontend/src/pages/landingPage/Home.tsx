import { useState } from "react";
import ChatBot from "../../components/chatbot/chatbot";
import Books from "../../components/common/Books";
// import CarouselC from "../../components/common/CarouselC"

function Home() {
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => setShowChat((prev) => !prev);

  return (
    <div>
      <Books />
      {/* Sticky Chatbot Icon */}
      <button
        onClick={toggleChat}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          fontSize: 24,
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
        aria-label="Open chat"
      >
        💬
      </button>
      {showChat && (
        <div style={{ position: "fixed", bottom: 90, right: 20, zIndex: 1000 }}>
          <ChatBot />
        </div>
      )}
    </div>
  );
}

export default Home
