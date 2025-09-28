import React, { useState } from "react";
import { useBackend } from "../context/BackendContext";

const stream_quizzes = {
  Science: [
    ["I enjoy solving complex mathematical problems.", "math_interest"],
    ["I am curious about chemical reactions and experiments.", "chemistry_interest"],
    ["I am fascinated by how the human body works.", "biology_interest"],
    ["I like coding, programming, or working with computers.", "cs_interest"],
    ["I enjoy physics problems related to motion, energy, or electricity.", "physics_interest"]
  ],
  Arts: [
    ["I enjoy writing stories, essays, or poems.", "writing_interest"],
    ["I am interested in historical events and their causes.", "history_interest"],
    ["I like discussing government, politics, or law.", "politics_interest"],
    ["I care deeply about social issues and community welfare.", "sociology_interest"],
    ["I enjoy drawing, painting, or creative expression.", "arts_interest"]
  ],
  Commerce: [
    ["I enjoy solving accounting or bookkeeping problems.", "accounting_interest"],
    ["I like analyzing supply-demand and market trends.", "economics_interest"],
    ["I am interested in money management and investments.", "finance_interest"],
    ["I enjoy thinking about business strategies.", "business_interest"],
    ["I am fascinated by advertising and marketing ideas.", "marketing_interest"]
  ],
  Vocational: [
    ["I enjoy working with machines and fixing gadgets.", "technical_skills_interest"],
    ["I am interested in cooking, baking, or hospitality work.", "hospitality_interest"],
    ["I like sewing, fashion, or interior design.", "design_interest"],
    ["I prefer learning through hands-on practice instead of theory.", "practical_learning_interest"],
    ["I am comfortable using tools, equipment, and manual skills.", "tools_interest"]
  ]
};

const Stage2Quiz = ({ predictedStream, setPredictedSubject }) => {
  const { backendUrl, loading, error } = useBackend();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <p>Loading backend URL...</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;
  if (!predictedStream) return <p>No predicted stream available</p>;

  const handleChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSubmit = async () => {
    if (!backendUrl) return;

    setSubmitting(true);
    setResult(null);

    try {
      // Build payload for Stage 2
      const payload = {
        predicted_stream: predictedStream,
        ...answers
      };

      console.log("Submitting payload to /stage2:", payload);

      const response = await fetch(`${backendUrl}/stage2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to get career prediction");

      const data = await response.json();
      setResult(data);
      console.log("Stage2 result:", data);

      // Pass predicted subject to parent for Stage 3
      if (data.predicted_subject && setPredictedSubject) {
        setPredictedSubject(data.predicted_subject);
      }

    } catch (err) {
      console.error(err);
      setResult({ error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Get questions for the predicted stream
  const questions = stream_quizzes[predictedStream] || [];

  return (
    <div className="max-w-3xl mx-auto p-4 mt-8">
      <h2 className="text-2xl font-bold mb-4">Stage 2: Career Prediction Quiz</h2>
      <p className="mb-4 text-gray-600">Based on your predicted stream: <strong>{predictedStream}</strong></p>

      {/* Quiz Questions */}
      {questions.map(([question, key]) => (
        <div key={key} className="mb-4 border-b pb-2">
          <p className="mb-2">{question}</p>
          <select
            value={answers[key] || ""}
            onChange={(e) => handleChange(key, e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">Select score (1-5)</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-green-600 text-white px-4 py-2 rounded mt-6 hover:bg-green-700"
      >
        {submitting ? "Predicting Career..." : "Predict Career"}
      </button>

      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          {result.error ? (
            <p className="text-red-600">Error: {result.error}</p>
          ) : (
            <>
              <p>
                <strong>Predicted Career:</strong> {result.predicted_career}
              </p>
              <p>
                <strong>Career Confidence:</strong> {result.career_confidence_percent}%
              </p>
              <p>
                <strong>Predicted Subject:</strong> {result.predicted_subject}
              </p>
              <p>
                <strong>Subject Confidence:</strong> {result.subject_confidence_percent}%
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Stage2Quiz;
