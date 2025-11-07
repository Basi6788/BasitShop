// src/components/AIImageAssistant.tsx
import React, { useState } from "react";
import { BASE_URL } from "../utils/api";
import imageCompression from 'browser-image-compression'; // <-- Step 1: Isko import karein

const AIImageAssistant = () => {
  const [file, setFile] = useState<File | null>(null);
  const [instruction, setInstruction] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false); // <-- Loading state add kiya hai

  const uploadAndExecute = async () => {
    if (!file) return alert("Please select a file first!");

    setIsLoading(true); // Loading shuru
    setResponse(null); // Purana response clear karein

    // Step 2: Compression options set karein
    const options = {
      maxSizeMB: 1,          // File ko max 1MB tak compress karega
      maxWidthOrHeight: 1920, // Max width/height
      useWebWorker: true,
    };

    try {
      // Step 3: Upload se pehle file ko compress karein
      console.log(`Original size: ${file.size / 1024 / 1024} MB`);
      const compressedFile = await imageCompression(file, options);
      console.log(`Compressed size: ${compressedFile.size / 1024 / 1024} MB`);

      // Step 4: Ab FormData mein compressed file daalein
      const formData = new FormData();
      formData.append("file", compressedFile, compressedFile.name); // Yahan 'compressedFile' use karein
      formData.append("instruction", instruction);

      // Step 5: API call
      const res = await fetch(`${BASE_URL}/api/admin/ai-image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        // Agar server 400/500 error de
        const errData = await res.json();
        throw new Error(errData.message || "Server error");
      }

      const data = await res.json();
      setResponse(data);

    } catch (err) {
      console.error(err);
      setResponse({ error: (err as Error).message || "Upload failed" });
    } finally {
      setIsLoading(false); // Loading khatam
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-2xl shadow-md text-white mt-4">
      <h2 className="text-xl font-semibold mb-2">🧠 AI Image Assistant</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="bg-gray-800 w-full text-sm text-gray-400 rounded mb-2"
        disabled={isLoading} // Loading ke waqt disable karein
      />
      <input
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="e.g., Add image to Romeo product"
        className="w-full bg-gray-800 text-white p-2 rounded mb-2"
        disabled={isLoading} // Loading ke waqt disable karein
      />
      <button
        onClick={uploadAndExecute}
        className={`w-full bg-green-600 px-4 py-2 rounded ${
          isLoading
            ? "bg-gray-500 cursor-not-allowed"
            : "hover:bg-green-700"
        }`}
        disabled={isLoading} // Button ko disable karein
      >
        {isLoading ? "Compressing & Uploading..." : "Upload & Execute"}
      </button>

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

export default AIImageAssistant;

