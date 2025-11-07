import React, { useState } from "react";
import { motion } from "framer-motion";
// FIX: Is path ko aapke structure (/src/components/ se /src/hooks/) ke mutabiq set kiya.
import { useAIChat } from "../hooks/useAIChat"; 

interface Props {
  isAdmin?: boolean;
}

const AIChatBubble: React.FC<Props> = ({ isAdmin }) => {
  const [open, setOpen] = useState(false);
  // FIX: isInitialized state ko use karein
  const { messages, sendMessage, loading, error, isAIConnected, isInitialized } = useAIChat(!!isAdmin);
  const [input, setInput] = useState("");

  // Dynamic status message logic
  let statusMessage: string | null = null;

  // FIX: isInitialized state ko use karke loading/waiting state dikhana
  if (!isInitialized) {
      statusMessage = "Loading AI status...";
  } else if (error) {
      statusMessage = `🔴 Error: ${error}`;
  } else if (loading) { 
      statusMessage = "AI thinking...";
  } else if (isAIConnected === false) {
      statusMessage = "🔴 AI Service Disabled. Check server configuration.";
  }
  
  // Display only the welcome message or the actual conversation/error
  const finalMessages = isInitialized ? messages : [];


  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg cursor-pointer z-50"
        whileHover={{ scale: 1.1 }}
        onClick={() => setOpen(!open)}
      >
        💬
      </motion.div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 right-6 bg-neutral-900 shadow-2xl rounded-2xl w-80 p-4 border border-purple-500/50 z-50"
        >
          <div className="h-64 overflow-y-auto border-b border-neutral-700 mb-3 space-y-2">
            
            {/* Display final messages */}
            {finalMessages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-2 rounded-lg max-w-[85%] ${m.from === "ai" 
                  ? "bg-purple-800 text-white self-start" 
                  : "bg-gray-700 text-white ml-auto"}`}
              >
                <strong className={m.from === "ai" ? "text-purple-300" : "text-gray-300"}>{m.from === "ai" ? "AI 🤖:" : "You: " }</strong> {m.text}
              </motion.div>
            ))}
            
            {/* Display Status/Loading/Error Message only if needed */}
            {(!isInitialized || error || isAIConnected === false) && (
                <p className={`p-2 text-xs rounded-md ${error || isAIConnected === false ? 'bg-red-900 text-red-300 border border-red-700' : 'text-gray-400'}`}>
                    {statusMessage}
                </p>
            )}
            
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim() || !isInitialized || isAIConnected === false) {
                  setError('AI is not ready or connection failed.');
                  return;
              }
              sendMessage(input);
              setInput("");
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border border-neutral-700 rounded-lg px-3 py-2 w-full mb-3 bg-neutral-800 text-white placeholder-gray-500"
              placeholder="Ask me anything..."
              disabled={loading || !isInitialized}
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-3 py-2 rounded-lg w-full hover:bg-purple-500 transition disabled:opacity-50"
              disabled={loading || !isInitialized || !input.trim()}
            >
              {loading ? "Analyzing..." : "Send Command ✨"}
            </button>
          </form>
        </motion.div>
      )}
    </>
  );
};

export default AIChatBubble;
