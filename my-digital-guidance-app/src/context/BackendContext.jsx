import React, { createContext, useContext, useState, useEffect } from "react";

const PANTRY_ID = "0c957982-a5ec-4da0-8172-e28b1be25b15";
const BASKET_NAME = "URL";
const TIMEOUT_MS = 5000; // 5 seconds timeout

const BackendContext = createContext();

export const BackendProvider = ({ children }) => {
  // Use the environment variable directly
  // VITE_API_BASE_URL is loaded from .env at build/dev time
  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
  
  // We can keep these simple for compatibility, or remove if not used elsewhere
  const loading = false;
  const error = null;
  const prompting = false;

  // No-op function since we don't need manual entry anymore, 
  // but kept to avoid breaking components that might call it
  const submitBackendUrl = (url) => {
    console.log("Backend URL is managed via .env file now.");
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
