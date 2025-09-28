import React, { useState } from "react";
import { useBackend } from "../context/BackendContext";

// Quiz questions array
const quiz_questions = [
  ["I enjoy solving puzzles, riddles, or brain teasers.", "Q1"],
  ["I can easily identify patterns in numbers, shapes, or data.", "Q2"],
  ["I often try to find logical reasons behind everyday problems.", "Q3"],
  ["I am comfortable working with numbers, percentages, and ratios.", "Q4"],
  ["I enjoy solving mathematical problems without using a calculator.", "Q5"],
  ["I like interpreting graphs, tables, and charts.", "Q6"],
  ["I can express my ideas clearly through writing or speaking.", "Q7"],
  ["I enjoy debating or discussing social issues with others.", "Q8"],
  ["I am confident in explaining things to a group of people.", "Q9"],
  ["I enjoy drawing, painting, music, dance, or other creative hobbies.", "Q10"],
  ["I often come up with unique or imaginative ideas.", "Q11"],
  ["I prefer subjects/activities that allow me to express myself artistically.", "Q12"],
  ["I am curious about how machines, gadgets, or natural phenomena work.", "Q13"],
  ["I like conducting experiments or practical activities in science labs.", "Q14"],
  ["I follow new discoveries in science and technology with interest.", "Q15"],
  ["I am interested in money management, trade, or entrepreneurship.", "Q16"],
  ["I like analyzing case studies related to business or economics.", "Q17"],
  ["I can imagine myself running my own business someday.", "Q18"],
  ["I enjoy working with my hands to build, repair, or create things.", "Q19"],
  ["I am good at using tools, machines, or craft-related tasks.", "Q20"],
  ["I prefer learning through doing rather than reading theory.", "Q21"],
  ["I enjoy taking responsibility in group projects.", "Q22"],
  ["I often motivate or guide others in teamwork activities.", "Q23"],
  ["People come to me for advice when making decisions.", "Q24"],
];

const Stage1Quiz = ({ setPredictedStream }) => {
  const { backendUrl, loading, error } = useBackend();
  const [answers, setAnswers] = useState({});
  const [marks, setMarks] = useState({
    maths: "",
    science: "",
    english: "",
    social: "",
    commerce: "",
  });
  const [gender, setGender] = useState(""); // 0=Male, 1=Female
  const [location, setLocation] = useState(""); // 0=Rural, 1=Urban, 2=Semi-Urban
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <p>Loading backend URL...</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  const handleChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleMarksChange = (key, value) => {
    setMarks((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSubmit = async () => {
    if (!backendUrl) return;

    setSubmitting(true);
    setResult(null);

    try {
      // Build payload
      const payload = {
        ...answers,
        maths_marks_percent: marks.maths,
        science_marks_percent: marks.science,
        english_marks_percent: marks.english,
        social_science_marks_percent: marks.social,
        commerce_marks_percent: marks.commerce,
        gender_encoded: Number(gender),
        location_encoded: Number(location),
      };

      console.log("Submitting payload to /stage1:", payload);

      const response = await fetch(`${backendUrl}/stage1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to get prediction");

      const data = await response.json();
      setResult(data);
      console.log("Stage1 result:", data);

      // Pass predicted stream to parent for Stage 2
     if (data.predicted_stream && setPredictedStream) {
    setPredictedStream(data.predicted_stream);
    }

    } catch (err) {
      console.error(err);
      setResult({ error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Stage 1: Stream Prediction Quiz</h2>

      {/* Quiz Questions */}
      {quiz_questions.map(([question, key]) => (
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

      {/* Marks Inputs */}
      <h3 className="text-xl font-semibold mt-6 mb-2">Enter Marks Percentage</h3>
      {[
        ["Maths", "maths"],
        ["Science", "science"],
        ["English", "english"],
        ["Social Science", "social"],
        ["Commerce", "commerce"],
      ].map(([label, key]) => (
        <div key={key} className="mb-2">
          <label className="block mb-1">{label}</label>
          <input
            type="number"
            value={marks[key]}
            onChange={(e) => handleMarksChange(key, e.target.value)}
            className="border p-2 w-full"
            min={0}
            max={100}
          />
        </div>
      ))}

      {/* Gender */}
      <div className="mt-4">
        <label className="block mb-1">Gender</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Select Gender</option>
          <option value={0}>Male</option>
          <option value={1}>Female</option>
        </select>
      </div>

      {/* Location */}
      <div className="mt-4">
        <label className="block mb-1">Location</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Select Location</option>
          <option value={0}>Rural</option>
          <option value={1}>Urban</option>
          <option value={2}>Semi-Urban</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-6 hover:bg-blue-700"
      >
        {submitting ? "Predicting..." : "Predict Stream"}
      </button>

      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          {result.error ? (
            <p className="text-red-600">Error: {result.error}</p>
          ) : (
            <>
              <p>
                <strong>Predicted Stream:</strong> {result.predicted_stream}
              </p>
              <p>
                <strong>Confidence:</strong> {result.confidence_percent}%
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Stage1Quiz;
