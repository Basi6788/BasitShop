// ✅ Path: src/hooks/useAIChat.ts
import { useState } from "react";
import axios from "axios";

export function useAIChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const backendURL = "https://romeo-backend.vercel.app/api/ai";

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);
    try {
      const res = await axios.post(backendURL, { message });
      const aiReply = res.data.reply || "⚠️ No response from AI.";
      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
    } catch (err) {
      console.error("AI Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ AI server not responding." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
