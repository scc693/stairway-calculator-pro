import React from 'react';
import PropTypes from 'prop-types';

const Blueprint = ({
  risePerStep,
  runPerStep,
  numberOfSteps,
  stringerWidth = 11.25,
  treadThickness = 1,
  riserThickness = 0.75
}) => {
  // SVG Scaling Logic
  // We need to fit the entire stair stringer into the viewbox.

  // Calculate total bounding box
  const totalRise = risePerStep * numberOfSteps;
  const totalRun = runPerStep * (numberOfSteps - 1); // Run usually is N-1 treads

  // Dimensions for SVG
  const margin = 20;
  // Scale factor: Map inches to pixels.
  // We want the SVG to handle responsiveness, so we set a viewBox and let CSS handle width.
  // Let's assume 1 unit = 1 inch for simplicity in path drawing.

  const width = Math.max(totalRun + stringerWidth + 20, 100); // minimal width
  const height = Math.max(totalRise + stringerWidth + 20, 100);

  const viewBox = `-${margin} -${margin} ${width + margin * 2} ${height + margin * 2}`;

  // Generate Path for Stringer
  // We start from top right or bottom left?
  // Let's start from Bottom Left (Ground) and go up.
  // Actually, standard carpentry drawings usually show the profile.
  // Let's draw the "sawtooth" pattern.

  // Coordinate system: (0,0) is top-left in SVG.
  // Let's translate so (0, height) is bottom-left (roughly).
  // Actually, let's keep it simple: Start at (0, totalRise) which is bottom-left-ish relative to top.

  // Points generation
  let path = `M 0 ${totalRise}`; // Bottom start point (toe of the stringer)

  // Loop for steps (going UP)
  // Each step: Go Horizontal (Run), then Vertical (Rise)
  for (let i = 0; i < numberOfSteps; i++) {
    // Current pos: Bottom of riser i
    // Draw Riser UP
    // SVG y coordinates increase downwards. So "UP" is subtracting from Y.
    const stepBottomY = totalRise - (i * risePerStep);
    const stepTopY = stepBottomY - risePerStep;
    const stepLeftX = i * runPerStep;
    const stepRightX = stepLeftX + runPerStep;

    // Draw Riser (Vertical up)
    // Move to start of step if not there (should be continuous)
    // path += ` L ${stepLeftX} ${stepTopY}`; // This would be just the line

    // Actually, simpler logic:
    // Start at bottom toe: (0, totalRise)
    // 1. Rise up: (0, totalRise - rise)
    // 2. Run right: (run, totalRise - rise)
    // ... repeat

    // However, the last step might differ depending on mounting.
    // Standard stringer:
    // 1. Rise
    // 2. Run
  }

  // Redoing path logic more carefully
  // We draw the TOP profile (the cut line).
  let d = `M 0 ${totalRise}`; // Bottom-most point (floor level, toe)

  // Note: The first riser cut usually starts at (0, totalRise) and goes up to (0, totalRise - rise)
  // But wait, the stringer rests on the floor.
  // The bottom cut is horizontal.

  // Let's trace the "Zig Zag" (Top edge of stringer board)
  let currentX = 0;
  let currentY = totalRise;

  // Bottom horizontal cut (usually run length or part of it? No, it sits on floor).
  // Actually, the stringer tip touches the floor.
  // Step 1 Riser: Goes UP from (0, totalRise).

  // Let's trace the CUT line.
  d = `M 0 ${totalRise}`;

  for (let i = 0; i < numberOfSteps; i++) {
     // Rise up
     currentY -= risePerStep;
     d += ` L ${currentX} ${currentY}`;

     // Run right (Tread)
     // For the last step, we still cut the run?
     // Usually the last riser goes against the header/deck.
     // So there is NO run cut for the very last step if it's flush.
     // But often we cut the run for the tread to sit on.
     if (i < numberOfSteps - 1) {
         currentX += runPerStep;
         d += ` L ${currentX} ${currentY}`;
     } else {
         // Top step (Deck level)
         // Usually we just have the riser cut, and the back of the stringer meets the hanger/beam.
         // Let's extend it back a bit to show the top land?
         // Or just stop at the top riser.
         currentX += runPerStep; // Extend for visual completeness
         d += ` L ${currentX} ${currentY}`;
     }
  }

  // Now we need the BOTTOM edge of the stringer.
  // The stringer width (e.g., 11.25 for 2x12) is measured *perpendicular* to the hypotenuse/rake.
  // Or, we can just offset the points?
  // It's easier to just draw the bottom line.

  // Calculate rake angle
  const angle = Math.atan(risePerStep / runPerStep);
  // Perpendicular vector (-sin, cos) * width?
  // The bottom edge is parallel to the nose-to-nose line.

  // Let's find the bottom corner points.
  // Start point (Bottom Toe): We moved UP `rise`. The bottom of the board is... where?
  // The stringer has a "throat".

  // Let's use a simpler approach for the visual:
  // Draw the zig zag.
  // Then close the shape by going down-left.
  // The bottom edge is a straight line connecting (BottomOffset) to (TopOffset).

  // Calculate throat depth (effective depth)
  // Throat = (Width * cos(angle)) - (Rise * sin(angle)) ??
  // Let's just create a closed polygon that looks right.
  // Bottom-Left point of the board.
  // Top-Right point of the board.

  // Point A: Top-Right of the last run.
  // Point B: Bottom-Left of the first rise.

  // We need to "return" to the start via the bottom edge.
  // We can calculate the offset perpendicular to the slope.
  // Slope vector: (run, -rise). Normalized...
  // Perpendicular vector: (-rise, -run)? No.
  // Down-Right perpendicular: (rise, run).

  // Let's effectively "stroke" the path with a thick line?
  // No, we need a vector shape.

  // Let's cheat slightly for visual simplicity if math gets hairy,
  // but accurate is better.

  // Angle of stairs
  const theta = Math.atan(risePerStep / runPerStep);

  // Offset for bottom edge (perpendicular distance = stringerWidth)
  const dx = stringerWidth * Math.sin(theta);
  const dy = stringerWidth * Math.cos(theta);

  // Bottom Edge Line:
  // Parallel to the "nosing line".
  // The nosing line connects the tips of the treads.
  // (Run, Rise_Top) -> (2*Run, Rise_Top - Rise) ...

  // The bottom edge is shifted by (dx, dy) relative to the re-entrant corners?
  // No, relative to the peaks.

  // Let's just draw the bottom line from the last point to the first point, offset.
  // Last Point: (currentX, currentY) -> Top Right
  // First Point: (0, totalRise) -> Bottom Left (Toe)

  const bottomX_End = currentX + dx;
  const bottomY_End = currentY + dy;

  const bottomX_Start = 0 + dx;
  const bottomY_Start = totalRise + dy;

  // Wait, that shift is perpendicular to the *nosing line*.
  // The stringer width is the board width.
  // Let's assume the "Board" creates the hypotenuse.
  // The zig-zag is cut OUT of the board.

  // So the bottom edge is the bottom edge of the board.
  // The top edge of the board touches the re-entrant corners (the inner corners of the step).

  // Inner corner 0: (run, totalRise - rise)
  // Inner corner 1: (2*run, totalRise - 2*rise)

  // The board's top edge passes through these inner corners.
  // The board's bottom edge is parallel to that, distance = Stringer Width *away*.

  // Let's find the inner corner of the first step.
  // Step 1: Up rise (0, totalRise - rise), Right run (run, totalRise - rise).
  // Inner corner is (0, totalRise - rise)? No.
  // The cut is: Up, then Right.
  // The inner corner is (0, totalRise - rise).

  // Actually, standard cut:
  // Face of riser. Top of tread.
  // Inner corner is at the intersection of Riser and Tread.

  // Let's calculate two points on the bottom edge line.
  // Inner corner 0: (0, totalRise - risePerStep) ?? No.
  // Step 0 starts at (0, totalRise). Goes UP to (0, totalRise - rise). Goes RIGHT to (run, totalRise - rise).
  // Inner corner is (0, totalRise - rise).

  // Inner corner Last: ((N-1)*run, TopY).

  // The "Top Edge" of the uncut board is the line connecting these inner corners.
  // The "Bottom Edge" of the board is parallel to that line, offset by `stringerWidth`.

  const innerCornerFirstX = 0;
  const innerCornerFirstY = totalRise - risePerStep;

  const innerCornerLastX = (numberOfSteps - 1) * runPerStep;
  const innerCornerLastY = totalRise - (numberOfSteps * risePerStep); // Top

  // Actually, let's just use the first inner corner and calculate the bottom line equation.
  // Line passes through (0, totalRise - risePerStep) with slope matching the stair angle.

  // Normal vector to the board edge (down-right).
  const nx = Math.sin(theta);
  const ny = Math.cos(theta);

  // Point on bottom edge corresponding to first inner corner
  const bottomEdgeX1 = innerCornerFirstX + (stringerWidth * nx);
  const bottomEdgeY1 = innerCornerFirstY + (stringerWidth * ny);

  // Point on bottom edge corresponding to last inner corner
  const bottomEdgeX2 = currentX + (stringerWidth * nx); // currentX is roughly the end
  const bottomEdgeY2 = currentY + (stringerWidth * ny);

  // We need to close the shape.
  // From last top point, go to bottom edge.
  // From bottom edge start, go to first start point.

  d += ` L ${bottomEdgeX2} ${bottomEdgeY2}`; // Line to bottom-right
  d += ` L ${bottomEdgeX1} ${bottomEdgeY1}`; // Line to bottom-left
  d += ` Z`; // Close

  // Dimensions Lines (Visual helpers)

  return (
    <div className="blueprint-container">
      <h3>Stringer Blueprint</h3>
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

        {/* Annotations could be added here */}
      </svg>
      <div className="blueprint-legend">
        <small>Scale: Not 1:1. Verify all measurements.</small>
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
