// src/utils/api.ts
export const BASE_URL = "https://romeo-backend.vercel.app";

export async function apiRequest(endpoint: string, method = "GET", body?: any) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}
