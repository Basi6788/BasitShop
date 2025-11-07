import React from "react";
// apiRequest ko import karein (path adjust karna pare ga)
import { apiRequest } from "../utils/api"; 

interface Props {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // FIX: apiRequest use kiya taake Auth Token aur Error Handling ho
  componentDidCatch(error: any, errorInfo: any) {
    const errorData = {
        error: error.message,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
    };
    
    // Attempt to log the error using the standardized apiRequest
    // NOTE: This uses the /api/ai/fix endpoint, which must be implemented on the backend
    apiRequest<{ success: boolean }>("/api/ai/fix", {
      method: "POST",
      // apiRequest khud hi Content-Type aur Auth Token add kar dega
      body: JSON.stringify(errorData), 
    }).then(() => {
        console.log("Error successfully reported to backend AI.");
    }).catch(err => {
        console.error("Failed to report error to backend:", err);
    });
  }

  render() {
    if (this.state.hasError)
      // Thoda styling add kiya taake mobile par acha lage
      return (
        <div className="p-6 text-center text-red-400 bg-neutral-900 border border-red-500 rounded-xl min-h-[300px] flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold mb-3">Critical Error 🛑</h1>
            <p className="mb-4">⚙️ Auto-fix triggered... please refresh your page!</p>
            <p className="text-sm text-gray-500">Error reported to Admin AI for analysis.</p>
        </div>
      );
    return this.props.children;
  }
}
