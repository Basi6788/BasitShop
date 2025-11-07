import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "https://romeo-backend.vercel.app";

export interface FrontendFile {
  path: string;
  name: string;
  type: "file" | "folder";
  content?: string;
}

export const fileService = {
  // 📂 List all frontend files
  async listFiles() {
    const res = await axios.get(`${API_BASE}/files/list`);
    return res.data as FrontendFile[];
  },

  // 📄 Get a specific file's content
  async getFile(path: string) {
    const res = await axios.get(`${API_BASE}/files/get`, { params: { path } });
    return res.data as FrontendFile;
  },

  // 💾 Update file code
  async updateFile(path: string, newCode: string) {
    const res = await axios.post(`${API_BASE}/files/update`, { path, newCode });
    return res.data;
  },

  // 🆕 Create new file
  async createFile(path: string, content: string) {
    const res = await axios.post(`${API_BASE}/files/create`, { path, content });
    return res.data;
  },

  // ❌ Delete a file
  async deleteFile(path: string) {
    const res = await axios.post(`${API_BASE}/files/delete`, { path });
    return res.data;
  },
};
