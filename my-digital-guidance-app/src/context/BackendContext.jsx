import React, { createContext, useContext, useState, useEffect } from "react";

const PANTRY_ID = "0c957982-a5ec-4da0-8172-e28b1be25b15";
const BASKET_NAME = "URL";
const TIMEOUT_MS = 5000; // 5 seconds timeout

const BackendContext = createContext();

export const BackendProvider = ({ children }) => {
  const [backendUrl, setBackendUrl] = useState(
    localStorage.getItem("backendUrl") || null
  );
  const [loading, setLoading] = useState(!backendUrl);
  const [error, setError] = useState(null);
  const [prompting, setPrompting] = useState(false);

  useEffect(() => {
    if (backendUrl) {
      console.log("[BackendContext] Backend URL loaded from localStorage:", backendUrl);
      setLoading(false);
      return;
    }

    const fetchBackendUrl = async () => {
      console.log("[BackendContext] Fetching backend URL from Pantry with timeout...");

      // Create a timeout promise
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Pantry request timed out")), TIMEOUT_MS)
      );

      try {
        const fetchPromise = fetch(
          `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${BASKET_NAME}`
        );

        const response = await Promise.race([fetchPromise, timeout]);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log("[BackendContext] Pantry data:", data);

        const url = data.backend_url || data.backendUrl || data.backendURL;

        if (!url) throw new Error("No backend URL found in Pantry data");

        console.log("[BackendContext] Backend URL fetched from Pantry:", url);
        setBackendUrl(url);
        localStorage.setItem("backendUrl", url);
      } catch (err) {
        console.error("[BackendContext] Error fetching Pantry URL:", err);
        setError(err);
        setPrompting(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendUrl();
  }, [backendUrl]);

  const submitBackendUrl = (url) => {
    if (url && url.trim() !== "") {
      console.log("[BackendContext] Backend URL entered manually:", url);
      setBackendUrl(url.trim());
      localStorage.setItem("backendUrl", url.trim());
      setPrompting(false);
      setError(null);
    }
  };

  return (
    <BackendContext.Provider
      value={{ backendUrl, loading, error, prompting, submitBackendUrl }}
    >
      {children}
    </BackendContext.Provider>
  );
};

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (!context) {
    console.warn(
      "[useBackend] Context not available! Wrap your app in BackendProvider."
    );
  }
  console.log("[useBackend] Current context:", context);
  return context;
};
