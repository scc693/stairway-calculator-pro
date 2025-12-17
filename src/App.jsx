import React, { useState } from 'react';
import InputForm from './components/InputForm';
import Blueprint from './components/Blueprint';
import SpeedSquare from './components/SpeedSquare';
import InstallPrompt from './components/InstallPrompt';
import { calculateStairs, formatDimension } from './utils/stairMath';
import { generatePDF } from './utils/pdfGenerator';
import useWakeLock from './hooks/useWakeLock';
import './index.css';
import './AppHeader.css';
import './components/Blueprint.css';

function App() {
  const [results, setResults] = useState(null);
  const { isSupported, wakeLock, requestWakeLock, releaseWakeLock } = useWakeLock();
  const [includeBlueprintInPDF, setIncludeBlueprintInPDF] = useState(true);

  const handleCalculate = (inputs) => {
    const totalRise = parseFloat(inputs.totalRise);
    const totalRun = inputs.totalRun ? parseFloat(inputs.totalRun) : 0;
    const targetStepRise = parseFloat(inputs.targetStepRise);
    const targetStepRun = parseFloat(inputs.targetStepRun);
    const treadThickness = parseFloat(inputs.treadThickness);
    const riserThickness = parseFloat(inputs.riserThickness);
    const stringerWidth = parseFloat(inputs.stringerWidth);

    if (isNaN(totalRise) || totalRise <= 0) {
      alert("Please enter a valid Total Rise.");
      return;
    }

    const calcResults = calculateStairs(
      totalRise,
      totalRun,
      targetStepRise,
      targetStepRun,
      treadThickness,
      riserThickness,
      stringerWidth
    );

    // Add inputs to results for passing to blueprint
    setResults({ ...calcResults, ...inputs });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Dundas Specialties</h1>
        <h2>Stairway Calculator Pro</h2>
      </header>

      <main className="app-content">
        <InputForm onCalculate={handleCalculate} />

        {results && (
          <>
            <div className="results-container">
               <div className="results-header">
                 <h3>Cut List Summary</h3>
                 <div className="action-buttons">
                    <div className="pdf-group">
                        <button onClick={() => generatePDF(results, includeBlueprintInPDF)} className="action-btn">Download PDF</button>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={includeBlueprintInPDF}
                                onChange={(e) => setIncludeBlueprintInPDF(e.target.checked)}
                            />
                            With Blueprint
                        </label>
                    </div>
                    {isSupported && (
                        <button
                            onClick={wakeLock ? releaseWakeLock : requestWakeLock}
                            className={`action-btn ${wakeLock ? 'active' : ''}`}
                        >
                            {wakeLock ? 'Screen Lock ON' : 'Keep Screen ON'}
                        </button>
                    )}
                 </div>
               </div>

               <div className="result-grid">
                 <div className="result-item">
                    <label>Number of Steps</label>
                    <span>{results.numberOfSteps}</span>
                 </div>
                 <div className="result-item">
                    <label>Rise per Step</label>
                    <span>{formatDimension(results.risePerStep)} ({results.risePerStep.toFixed(3)}")</span>
                 </div>
                 <div className="result-item">
                    <label>Run per Step</label>
                    <span>{formatDimension(results.runPerStep)} ({results.runPerStep.toFixed(3)}")</span>
                 </div>
                 <div className="result-item">
                    <label>Stringer Length (Approx)</label>
                    <span>{formatDimension(results.stringerLength)}</span>
                 </div>
               </div>
            </div>

            <Blueprint
                risePerStep={results.risePerStep}
                runPerStep={results.runPerStep}
                numberOfSteps={results.numberOfSteps}
                stringerWidth={parseFloat(results.stringerWidth)}
            />

            <SpeedSquare
                angleDegrees={results.angleDegrees}
                risePerStep={results.risePerStep}
                runPerStep={results.runPerStep}
            />
          </>
        )}
        <InstallPrompt />
      </main>
    </div>
  );
}

export default App;
