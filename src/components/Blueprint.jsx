import React from 'react';
import PropTypes from 'prop-types';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const Blueprint = ({
  risePerStep,
  runPerStep,
  numberOfSteps,
  stringerWidth = 11.25,
}) => {
  // Constants and Setup
  const totalRise = risePerStep * numberOfSteps;
  // Standard stringer: N risers, N-1 treads.
  // Total run is width of the treads.
  const totalRun = runPerStep * (numberOfSteps - 1);

  const margin = 40;

  // Geometric Calculation
  // 1. Tips Line (Top Edge of Uncut Board)
  const theta = Math.atan(risePerStep / runPerStep); // Rake angle

  // 2. Bottom Line (Bottom Edge of Uncut Board)
  // Parallel to Tips Line, offset by stringerWidth.
  // Offset Vector (Normal to Rake, pointing Down-Right):
  const dx = stringerWidth * Math.sin(theta);
  const dy = stringerWidth * Math.cos(theta);

  // Determine a point on the Bottom Line.
  // Use Tip 1 projected.
  const tip1X = 0;
  const tip1Y = totalRise - risePerStep;
  const pBottomRefX = tip1X + dx;
  const pBottomRefY = tip1Y + dy;

  // Slope m for SVG line: dy/dx = -Rise/Run
  const m = -risePerStep / runPerStep;

  // Bottom Line Equation: y - y0 = m(x - x0)
  // y = m(x - pBottomRefX) + pBottomRefY

  // 3. Intersections
  // Intersection with Floor (y = TotalRise)
  const xFloor = pBottomRefX + (totalRise - pBottomRefY) / m;

  // Intersection with Back Vertical (x = TotalRun)
  // y_back = m(TotalRun - pBottomRefX) + pBottomRefY
  const yBack = m * (totalRun - pBottomRefX) + pBottomRefY;

  // ViewBox Calculation
  // We need to include xFloor (could be negative?), TotalRun, TotalRise.
  const minX = Math.min(0, xFloor, -10);
  const maxX = Math.max(totalRun, xFloor) + margin;
  const minY = Math.min(0, totalRise - (numberOfSteps * risePerStep)) - margin;
  const maxY = totalRise + margin;

  const viewBox = `${minX - margin} ${minY} ${maxX - minX + margin*2} ${maxY - minY}`;

  // Build Path
  let d = `M 0 ${totalRise}`; // Start at Floor/Toe corner

  // Zig Zag Steps
  let currentX = 0;
  let currentY = totalRise;

  // Draw N-1 Treads (and N Risers logic)
  // 0 to N-2
  for (let i = 0; i < numberOfSteps - 1; i++) {
     currentY -= risePerStep; // Up Riser
     d += ` L ${currentX} ${currentY}`;

     currentX += runPerStep; // Right Tread
     d += ` L ${currentX} ${currentY}`;
  }

  // Last Riser (Top)
  currentY -= risePerStep;
  d += ` L ${currentX} ${currentY}`;
  // We are now at (TotalRun, TopY). This is the top-most point.

  // Back Vertical Cut (Down to Bottom Line)
  d += ` L ${currentX} ${yBack}`;

  // Bottom Line (Back to Floor)
  d += ` L ${xFloor} ${totalRise}`;

  // Floor Line (Back to Start)
  d += ` Z`;

  return (
    <div className="blueprint-container">
      <h3>Stringer Blueprint</h3>

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
      >
        <TransformComponent wrapperClass="zoom-wrapper" contentClass="zoom-content" wrapperStyle={{ width: "100%", height: "100%" }}>
            <svg viewBox={viewBox} className="stair-svg">
                <defs>
                    <pattern id="woodPattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="10" stroke="#dcbfa6" strokeWidth="1" />
                    </pattern>
                </defs>

                {/* Stringer Shape */}
                <path d={d} fill="url(#woodPattern)" stroke="#8d6e63" strokeWidth="2" />

                {/* Outline for clarity */}
                <path d={d} fill="none" stroke="var(--text-primary)" strokeWidth="1" />
            </svg>
        </TransformComponent>
      </TransformWrapper>

      <div className="blueprint-legend">
        <small>Scale: Not 1:1. Scroll/Pinch to Zoom. Drag to Pan.</small>
      </div>
    </div>
  );
};

Blueprint.propTypes = {
  risePerStep: PropTypes.number.isRequired,
  runPerStep: PropTypes.number.isRequired,
  numberOfSteps: PropTypes.number.isRequired,
  stringerWidth: PropTypes.number,
  treadThickness: PropTypes.number,
  riserThickness: PropTypes.number
};

export default Blueprint;
