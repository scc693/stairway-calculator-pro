export const stairLimits = {
  rise: { min: 4, max: 12 },
  run: { min: 7, max: 14 }
};

const within = (value, { min, max }) =>
  Number.isFinite(value) && value >= min && value <= max;

export function calculateStairPlan(inputs) {
  const { totalRise, totalRun, targetStepRise, targetStepRun, stringerWidth } = inputs;
  if (!within(totalRise, { min: stairLimits.rise.min * 2, max: 300 })) {
    throw new Error('Enter a total rise of 8 to 300 inches. This calculator requires at least two risers.');
  }
  if (!within(totalRun, { min: 0, max: 500 })) {
    throw new Error('Enter a total run of 0 to 500 inches. Use 0 for automatic run.');
  }
  if (!within(targetStepRise, stairLimits.rise) || !within(targetStepRun, stairLimits.run)) {
    throw new Error('Enter a target rise of 4 to 12 inches and a target run of 7 to 14 inches.');
  }
  if (![7.25, 9.25, 11.25].includes(stringerWidth)) {
    throw new Error('Select one of the available stringer widths.');
  }

  const preferred = Math.round(totalRise / targetStepRise);
  const candidates = [];
  for (let risers = 2; risers <= Math.floor(totalRise / stairLimits.rise.min); risers++) {
    const rise = totalRise / risers;
    const run = totalRun === 0 ? targetStepRun : totalRun / (risers - 1);
    if (within(rise, stairLimits.rise) && within(run, stairLimits.run)) {
      candidates.push({ risers, rise, run });
    }
  }

  const candidate = candidates
    .sort((a, b) => Math.abs(a.risers - preferred) - Math.abs(b.risers - preferred))
    .find(({ rise, run }) => stringerWidth > (rise * run) / Math.hypot(rise, run));

  if (!candidate) {
    if (candidates.length === 0) {
      throw new Error('No layout fits the calculator’s rise and run limits. Adjust the total dimensions.');
    }
    throw new Error('The selected board is too narrow for the available layouts. Select wider stock or adjust the dimensions.');
  }

  return calculateStairs(totalRise, totalRun, candidate.rise, targetStepRun);
}

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

  // Generate layout marks (cumulative hypotenuse distances)
  const layoutMarks = Array.from({ length: numberOfSteps }, (_, i) => {
    return (i + 1) * stepHypotenuse;
  });

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
    stepHypotenuse,
    layoutMarks
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
