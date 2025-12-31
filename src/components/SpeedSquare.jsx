import PropTypes from 'prop-types';
import './SpeedSquare.css';
import './SpeedSquareInstructions.css';

const SpeedSquare = ({ angleDegrees, risePerStep, runPerStep }) => {
  return (
    <div className="speed-square-container">
      <h3>Speed Square Guide</h3>

      <div className="guide-content">
        <div className="guide-metric">
          <span className="label">Cut Angle</span>
          <span className="value">{angleDegrees.toFixed(2)}°</span>
        </div>

        <div className="guide-instructions">
          <h4>Alignment Instructions</h4>

          <div className="instruction-block">
              <h5>Option 1: Speed Square (Rafter Square)</h5>
              <p>Best for marking the cut angle.</p>
              <ul>
                  <li><strong>Pivot Point:</strong> Place the pivot point at the edge of the board.</li>
                  <li><strong>Rotate:</strong> Rotate the square until the <b>{angleDegrees.toFixed(2)}°</b> mark on the "Common" or "Degrees" scale aligns with the same edge.</li>
                  <li>Mark the line along the square's edge.</li>
              </ul>
          </div>

          <div className="instruction-block">
              <h5>Option 2: Framing Square (Carpenter's Square)</h5>
              <p>Best for marking both rise and run simultaneously.</p>
              <ul>
                <li><strong>Tongue (Rise):</strong> Align the <b>{risePerStep.toFixed(3)}"</b> mark on the narrow arm with the board edge.</li>
                <li><strong>Body (Run):</strong> Align the <b>{runPerStep.toFixed(3)}"</b> mark on the wide arm with the same board edge.</li>
              </ul>
          </div>

          <p className="note">Ensure the corner of the square is pointing AWAY from the stringer material for the cut out.</p>
        </div>
      </div>
    </div>
  );
};

SpeedSquare.propTypes = {
  angleDegrees: PropTypes.number.isRequired,
  risePerStep: PropTypes.number.isRequired,
  runPerStep: PropTypes.number.isRequired
};

export default SpeedSquare;
