// src/components/AICommandConsole.tsx
import React, { useState } from "react";
import { apiRequest } from "../utils/api";

const AICommandConsole = () => {
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState<any>(null);

  const executeCommand = async () => {
    setResponse(null);
    try {
      const res = await apiRequest("/api/admin/command", "POST", { command });
      setResponse(res);
    } catch (err) {
      setResponse({ error: "Command failed" });
    }
  };

  const analyzeFrontend = async () => {
    try {
      const res = await apiRequest("/api/admin/analyze-frontend", "POST", {});
      setResponse(res);
    } catch (err) {
      setResponse({ error: "Analyze failed: API not found" });
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-2xl shadow-md text-white">
      <h2 className="text-xl font-semibold mb-2">🤖 AI Command Console</h2>
      <input
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder="Command likhein..."
        className="w-full bg-gray-800 text-white p-2 rounded mb-2"
      />
      <div className="flex gap-2">
        <button
          onClick={executeCommand}
          className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
        >
          Execute
        </button>
        <button
          onClick={analyzeFrontend}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
        >
          Analyze Frontend
        </button>
      </div>

      {response && (
        <div
          className={`mt-3 p-3 rounded ${
            response.error ? "bg-red-800" : "bg-green-800"
          }`}
        >
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AICommandConsole;
