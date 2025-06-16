import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://your-backend.onrender.com"); // <-- CHANGE to your backend URL

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("chat history", (msgs) => {
      setMessages(msgs);
    });

    socket.on("unauthorized", () => {
      alert("Unauthorized: Invalid access code");
    });

    return () => {
      socket.off("chat message");
      socket.off("chat history");
      socket.off("unauthorized");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit("chat message", { content: input });
      setInput("");
    }
  };

  const handleAccess = (e) => {
    e.preventDefault();
    if (code === "SMSO21") {
      socket.emit("auth", code);
      setAccessGranted(true);
    } else {
      alert("Invalid code.");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!accessGranted) {
    return (
      <div style={{ maxWidth: 400, margin: "150px auto", padding: 20, background: "#fff", borderRadius: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Enter Access Code</h2>
        <form onSubmit={handleAccess} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code..."
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
          <button type="submit" style={{ padding: 10, borderRadius: 10, backgroundColor: "#28a745", color: "white", fontWeight: "bold" }}>
            Enter Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 20, background: "#fff", borderRadius: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.15)", height: "90vh", display: "flex", flexDirection: "column" }}>
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>Real-Time Chat</h1>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 20 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ background: "#f1f1f1", padding: 10, borderRadius: 15, marginBottom: 10, maxWidth: "80%" }}>
            {msg.content || msg}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 10, borderRadius: 15, border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "10px 20px", borderRadius: 15, backgroundColor: "#007bff", color: "white", fontWeight: "bold" }}>
          Send
        </button>
      </form>
    </div>
  );
}

