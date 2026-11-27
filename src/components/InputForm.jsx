import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './InputForm.css';

const InputForm = ({ onCalculate, loadedFields }) => {
  const [inputs, setInputs] = useState({
    totalRise: '',
    totalRun: '',
    targetStepRise: 7.5,
    targetStepRun: 10,
    stringerWidth: 11.25
  });

  useEffect(() => {
    if (loadedFields) setInputs(loadedFields);
  }, [loadedFields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate(inputs);
  };

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor="totalRise">Total Rise (inches)*</label>
        <input
          type="number"
          id="totalRise"
          name="totalRise"
          step="0.0625"
          value={inputs.totalRise}
          onChange={handleChange}
          required
          placeholder="e.g., 108"
        />
      </div>

      <div className="input-group">
        <label htmlFor="totalRun">Total Run (inches)</label>
        <input
          type="number"
          id="totalRun"
          name="totalRun"
          step="0.0625"
          value={inputs.totalRun}
          onChange={handleChange}
          placeholder="Optional (Auto-calc if empty)"
        />
        <small>Leave empty to calculate based on target step run.</small>
      </div>

      <div className="settings-group">
        <h3>Settings</h3>
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="targetStepRise">Target Rise</label>
            <input
              type="number"
              id="targetStepRise"
              name="targetStepRise"
              step="0.125"
              value={inputs.targetStepRise}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="targetStepRun">Target Run</label>
            <input
              type="number"
              id="targetStepRun"
              name="targetStepRun"
              step="0.125"
              value={inputs.targetStepRun}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="input-row">
           <div className="input-group">
            <label htmlFor="stringerWidth">Stringer Width</label>
            <select
                name="stringerWidth"
                id="stringerWidth"
                value={inputs.stringerWidth}
                onChange={handleChange}
            >
                <option value="7.25">2x8 (7.25")</option>
                <option value="9.25">2x10 (9.25")</option>
                <option value="11.25">2x12 (11.25")</option>
            </select>
          </div>
        </div>

        <small>Calculator limits are 4–12 inches per rise and 7–14 inches per run. Verify local requirements and finished tread and riser details before cutting.</small>
      </div>

      <button type="submit" className="calculate-btn">Calculate</button>
    </form>
  );
};

InputForm.propTypes = {
  onCalculate: PropTypes.func.isRequired,
  loadedFields: PropTypes.object
};

export default InputForm;
