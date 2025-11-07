import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "https://romeo-backend.vercel.app";

interface AIContextType {
  analyzing: boolean;
  analysisResult: any;
  analyzeFrontend: () => Promise<void>;
  updateFile: (path: string, newCode: string) => Promise<void>;
  createFile: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // 🔍 Analyze frontend structure
  const analyzeFrontend = async () => {
    try {
      setAnalyzing(true);
      const res = await axios.get(`${API_BASE}/ai/analyze-frontend`);
      setAnalysisResult(res.data);
    } catch (err) {
      console.error("Error analyzing frontend:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // ✏️ Update file content
  const updateFile = async (path: string, newCode: string) => {
    await axios.post(`${API_BASE}/ai/update-file`, { path, newCode });
  };

  // 📄 Create a new file
  const createFile = async (path: string, content: string) => {
    await axios.post(`${API_BASE}/ai/create-file`, { path, content });
  };

  // ❌ Delete a file
  const deleteFile = async (path: string) => {
    await axios.post(`${API_BASE}/ai/delete-file`, { path });
  };

  return (
    <AIContext.Provider value={{ analyzing, analysisResult, analyzeFrontend, updateFile, createFile, deleteFile }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error("useAI must be used within AIProvider");
  return context;
};
