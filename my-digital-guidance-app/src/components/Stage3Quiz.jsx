import React, { useState, useEffect } from "react";
import { useBackend } from "../context/BackendContext";

const Stage3Quiz = ({ predictedStream, predictedSubject }) => {
  const { backendUrl, loading, error } = useBackend();
  const [colleges, setColleges] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (predictedStream && predictedSubject && backendUrl) {
      fetchColleges();
    }
  }, [predictedStream, predictedSubject, backendUrl]);

  const fetchColleges = async () => {
    if (!backendUrl) return;

    setSubmitting(true);
    setResult(null);

    try {
      // Build payload for Stage 3
      const payload = {
        predicted_stream: predictedStream,
        predicted_subject: predictedSubject
      };

      console.log("Submitting payload to /stage3:", payload);

      const response = await fetch(`${backendUrl}/stage3`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to get college recommendations");

      const data = await response.json();
      setResult(data);
      setColleges(data.recommended_colleges || []);
      console.log("Stage3 result:", data);

    } catch (err) {
      console.error(err);
      setResult({ error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading backend URL...</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;
  if (!predictedStream || !predictedSubject) return <p>No stream or subject data available</p>;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="text-gray-300">☆</span>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 mt-8">
      <h2 className="text-2xl font-bold mb-4">Stage 3: College Recommendations</h2>
      <p className="mb-6 text-gray-600">
        Based on your predicted stream: <strong>{predictedStream}</strong> and subject: <strong>{predictedSubject}</strong>
      </p>

      {submitting && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Finding the best colleges for you...</p>
        </div>
      )}

      {result && result.error && (
        <div className="mt-4 p-4 border rounded bg-red-50 border-red-200">
          <p className="text-red-600">Error: {result.error}</p>
        </div>
      )}

      {colleges.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges.map((college, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              {/* College Header */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {college.college_name}
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {college.city}
                  </span>
                  {getRatingStars(college.rating)}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Stream:</span> {college.stream}
                </div>
              </div>

              {/* College Details */}
              <div className="p-6">
                {/* Subjects */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Subjects Offered:</h4>
                  <div className="flex flex-wrap gap-1">
                    {college.subjects.map((subject, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tuition Fees */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Tuition Fees:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(college.tuition_fees)}
                    </span>
                  </div>
                </div>

                {/* Key Information */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accreditation:</span>
                    <span className="font-medium">{college.accreditation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Faculty Count:</span>
                    <span className="font-medium">{college.faculty_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Package:</span>
                    <span className="font-medium">{college.average_package}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Placement:</span>
                    <span className={`font-medium ${
                      college.placement_opportunities === 'High' ? 'text-green-600' : 
                      college.placement_opportunities === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {college.placement_opportunities}
                    </span>
                  </div>
                </div>

                {/* Facilities */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Facilities:</h4>
                  <div className="flex flex-wrap gap-1">
                    {college.facilities.map((facility, idx) => (
                      <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hostel & Transport */}
                <div className="mt-4 flex justify-between text-sm">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${college.hostel ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-gray-600">Hostel</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${college.transport_available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-gray-600">Transport</span>
                  </div>
                </div>

                {/* Scholarship */}
                {college.scholarship && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-sm font-medium text-yellow-800">Scholarship Available</div>
                    <div className="text-xs text-yellow-700">{college.scholarship_eligibility}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {colleges.length === 0 && !submitting && result && !result.error && (
        <div className="text-center py-8">
          <p className="text-gray-600">No colleges found for your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Stage3Quiz;
