import React, { useState } from "react";
import { useBackend } from "./context/BackendContext";
import Home from "./pages/Home";

function App() {
  const { backendUrl, loading, error, prompting, submitBackendUrl } = useBackend();
  const [inputUrl, setInputUrl] = useState("");

  if (loading) return <p className="p-4">Loading backend URL...</p>;

  if (prompting)
    return (
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Enter Backend URL manually</h2>
        {error && <p className="text-red-600 mb-2">Error: {error.message}</p>}
        <input
          type="text"
          placeholder="https://your-backend-url"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
        />
        <button
          onClick={() => submitBackendUrl(inputUrl.trim())}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Backend URL is ready!</h1>
      <p className="text-blue-600 mb-4">{backendUrl}</p>

      {/* Render Home component with both Stage 1 and Stage 2 */}
      <Home />
    </div>
  );
}

export default App;
