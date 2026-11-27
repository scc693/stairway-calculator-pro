import { useState } from 'react';
import InputForm from './components/InputForm';
import Blueprint from './components/Blueprint';
import SpeedSquare from './components/SpeedSquare';
import SavedCalculations from './components/SavedCalculations';
import InstallPrompt from './components/InstallPrompt';
import { calculateStairPlan, formatDimension } from './utils/stairMath';
import useWakeLock from './hooks/useWakeLock';
import './index.css';
import './AppHeader.css';
import './AppResults.css';
import './components/Blueprint.css';

function App() {
  const [calculation, setCalculation] = useState(null);
  const [loadedFields, setLoadedFields] = useState(null);
  const [error, setError] = useState('');
  const results = calculation?.results;
  const { isSupported, wakeLock, requestWakeLock, releaseWakeLock } = useWakeLock();
  const [includeBlueprintInPDF, setIncludeBlueprintInPDF] = useState(true);

  const handleGeneratePDF = async () => {
    try {
      const { generatePDF } = await import('./utils/pdfGenerator');
      await generatePDF(calculation, includeBlueprintInPDF);
    } catch {
      setError('PDF export failed. Please try again.');
    }
  };

  const handleCalculate = (fields) => {
    const inputs = {
      totalRise: Number(fields.totalRise),
      totalRun: Number(fields.totalRun),
      targetStepRise: Number(fields.targetStepRise),
      targetStepRun: Number(fields.targetStepRun),
      stringerWidth: Number(fields.stringerWidth)
    };
    try {
      setCalculation({ inputs, results: calculateStairPlan(inputs) });
      setError('');
    } catch (err) {
      setCalculation(null);
      setError(err.message);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Dundas Specialties</h1>
        <h2>Stairway Calculator Pro</h2>
      </header>

      <main className="app-content">
        <InputForm onCalculate={handleCalculate} loadedFields={loadedFields} />
        {error && <p role="alert">{error}</p>}

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
                stringerWidth={calculation.inputs.stringerWidth}
            />

            <SpeedSquare
                angleDegrees={results.angleDegrees}
                risePerStep={results.risePerStep}
                runPerStep={results.runPerStep}
            />
          </>
        )}
        {window.location.hostname === 'stairs.clearteck.org' && (
          <SavedCalculations inputs={calculation?.inputs} onLoad={(saved) => {
            setLoadedFields({ ...saved, totalRun: saved.totalRun || '' });
            handleCalculate(saved);
          }} />
        )}
        <InstallPrompt />
      </main>
    </div>
  );
}

export default App;
