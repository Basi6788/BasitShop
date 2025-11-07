// src/hooks/useFetch.ts
import { useState, useEffect } from "react";
import { apiRequest } from "../utils/api";

export const useFetch = (endpoint: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest(endpoint);
        setData(res);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [endpoint]);

  return { data, loading, error };
};
