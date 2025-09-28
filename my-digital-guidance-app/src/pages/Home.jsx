import React, { useState } from "react";
import Stage1Quiz from "../components/Stage1Quiz";
import Stage2Quiz from "../components/Stage2Quiz";
import Stage3Quiz from "../components/Stage3Quiz";

const Home = () => {
  const [predictedStream, setPredictedStream] = useState(null);
  const [predictedSubject, setPredictedSubject] = useState(null);

  return (
    <div className="p-4">
      {/* Stage 1 */}
      <Stage1Quiz setPredictedStream={setPredictedStream} />

      {/* Stage 2 */}
      {predictedStream && (
        <Stage2Quiz 
          predictedStream={predictedStream} 
          setPredictedSubject={setPredictedSubject}
        />
      )}

      {/* Stage 3 */}
      {predictedStream && predictedSubject && (
        <Stage3Quiz 
          predictedStream={predictedStream} 
          predictedSubject={predictedSubject}
        />
      )}
    </div>
  );
};

export default Home;
