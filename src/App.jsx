import { useState } from 'react';
import InputForm from './components/InputForm';
import Blueprint from './components/Blueprint';
import SpeedSquare from './components/SpeedSquare';
import InstallPrompt from './components/InstallPrompt';
import { calculateStairs, formatDimension } from './utils/stairMath';
import useWakeLock from './hooks/useWakeLock';
import './index.css';
import './AppHeader.css';
import './components/Blueprint.css';

function App() {
  const [results, setResults] = useState(null);
  const { isSupported, wakeLock, requestWakeLock, releaseWakeLock } = useWakeLock();
  const [includeBlueprintInPDF, setIncludeBlueprintInPDF] = useState(true);

  const handleGeneratePDF = async () => {
    const { generatePDF } = await import('./utils/pdfGenerator');
    await generatePDF(results, includeBlueprintInPDF);
  };

  const handleCalculate = (inputs) => {
    const totalRise = parseFloat(inputs.totalRise);
    const totalRun = inputs.totalRun ? parseFloat(inputs.totalRun) : 0;
    const targetStepRise = parseFloat(inputs.targetStepRise);
    const targetStepRun = parseFloat(inputs.targetStepRun);
    const treadThickness = parseFloat(inputs.treadThickness);
    const riserThickness = parseFloat(inputs.riserThickness);
    const stringerWidth = parseFloat(inputs.stringerWidth);

    // Comprehensive input validation
    const errors = [];

    if (isNaN(totalRise) || totalRise <= 0) {
      errors.push("Total Rise must be greater than 0");
    } else if (totalRise > 300) {
      errors.push("Total Rise seems too large (max 300 inches)");
    }

    if (totalRun < 0) {
      errors.push("Total Run cannot be negative");
    } else if (totalRun > 500) {
      errors.push("Total Run seems too large (max 500 inches)");
    }

    if (isNaN(targetStepRise) || targetStepRise <= 0) {
      errors.push("Target Step Rise must be greater than 0");
    } else if (targetStepRise < 4 || targetStepRise > 12) {
      errors.push("Target Step Rise should be between 4 and 12 inches (building codes)");
    }

    if (isNaN(targetStepRun) || targetStepRun <= 0) {
      errors.push("Target Step Run must be greater than 0");
    } else if (targetStepRun < 7 || targetStepRun > 14) {
      errors.push("Target Step Run should be between 7 and 14 inches (building codes)");
    }

    if (isNaN(treadThickness) || treadThickness < 0) {
      errors.push("Tread Thickness cannot be negative");
    } else if (treadThickness > 5) {
      errors.push("Tread Thickness seems too large (max 5 inches)");
    }

    if (isNaN(riserThickness) || riserThickness < 0) {
      errors.push("Riser Thickness cannot be negative");
    } else if (riserThickness > 5) {
      errors.push("Riser Thickness seems too large (max 5 inches)");
    }

    if (isNaN(stringerWidth) || stringerWidth <= 0) {
      errors.push("Stringer Width must be greater than 0");
    } else if (stringerWidth < 5 || stringerWidth > 15) {
      errors.push("Stringer Width should be between 5 and 15 inches");
    }

    if (errors.length > 0) {
      alert("Validation Errors:\n\n" + errors.join("\n"));
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
                        <button onClick={handleGeneratePDF} className="action-btn">Download PDF</button>
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

               <div className="layout-marks-section">
                   <h4>Stringer Layout Marks (Cumulative)</h4>
                   <p className="description-text">Measure along the edge of the stringer board from the bottom.</p>
                   <div className="layout-marks-grid">
                       {results.layoutMarks.map((mark, index) => (
                           <div key={index} className="mark-item">
                               <span className="mark-label">Step {index + 1}:</span>
                               <span className="mark-value">{formatDimension(mark)}</span>
                           </div>
                       ))}
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
