export const calculateStairs = (
  totalRise,
  totalRun,
  targetStepRise = 7.5,
  targetStepRun = 10,
  treadThickness = 1,
  riserThickness = 0.75,
  stringerWidth = 11.25 // 2x12 nominal
) => {
  // 1. Calculate Number of Steps based on Rise
  // Ideally, rise per step should be close to targetStepRise
  let numberOfSteps = Math.round(totalRise / targetStepRise);

  // If totalRun is provided (non-zero), we might need to adjust, but typically
  // rise is the hard constraint in stair building.
  // However, sometimes run is fixed. If totalRun is fixed, we calculate step run.

  // Actually, standard carpenter logic:
  // If Total Run is flexible (0 or null), we determine it based on optimal step run.
  // If Total Run is fixed, we determine step run.

  if (numberOfSteps === 0) numberOfSteps = 1; // Prevent division by zero

  const risePerStep = totalRise / numberOfSteps;

  let runPerStep = targetStepRun;
  let calculatedTotalRun = totalRun;

  if (totalRun > 0) {
    // Fixed Run
    // Note: Number of treads is usually (NumberOfSteps - 1) if the top floor is the last step.
    // But for a standard stringer, we usually cut N steps.
    // Let's assume N steps means N risers.
    // Treads = Risers - 1 (usually).
    if (numberOfSteps > 1) {
      runPerStep = totalRun / (numberOfSteps - 1);
    } else {
      // If there is only 1 step, the "run" is the total run provided
      runPerStep = totalRun;
    }
    calculatedTotalRun = totalRun;
  } else {
    // Flexible Run
    // If numberOfSteps is 1, calculatedTotalRun is usually just the target step run
    // or 0 if we consider run is determined by treads.
    // But physically, the stringer has run.
    calculatedTotalRun = runPerStep * Math.max(1, numberOfSteps - 1);
  }

  // Stringer Math (Pythagorean theorem for one step)
  // The hypotenuse of one step triangle
  const stepHypotenuse = Math.sqrt(Math.pow(risePerStep, 2) + Math.pow(runPerStep, 2));

  // Total Stringer Length (approximate, before adjustments)
  // A stringer usually has (N) rise cuts and (N-1) run cuts.
  // The length needs to accommodate the diagonal.
  // We can approximate it as stepHypotenuse * numberOfSteps.
  // More accurately, it's the diagonal of the total bounding box, but for cutting,
  // carpenters need the length of the board required.
  const stringerLength = stepHypotenuse * numberOfSteps;

  // Angle in radians and degrees
  const angleRadians = Math.atan(risePerStep / runPerStep);
  const angleDegrees = angleRadians * (180 / Math.PI);

  return {
    numberOfSteps, // Risers
    numberOfTreads: numberOfSteps - 1,
    risePerStep,
    runPerStep,
    totalRise,
    totalRun: calculatedTotalRun,
    stringerLength,
    angleRadians,
    angleDegrees,
    stepHypotenuse
  };
};

export const formatDimension = (inches) => {
    // Helper to format decimal inches to fractional inches (nearest 1/16)
    if (!inches && inches !== 0) return '';

    const whole = Math.floor(inches);
    const decimal = inches - whole;
    const sixteenths = Math.round(decimal * 16);

    if (sixteenths === 0) return `${whole}"`;
    if (sixteenths === 16) return `${whole + 1}"`;

    // Simplify fraction
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const divisor = gcd(sixteenths, 16);

    return `${whole > 0 ? whole + ' ' : ''}${sixteenths / divisor}/${16 / divisor}"`;
};
