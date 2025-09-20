(function (globalThis, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    globalThis.StairMath = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {
  const ASSUMED_STAIR_WIDTH_IN = 36;
  const DEFAULTS = Object.freeze({
    totalRiseIn: 108,
    treadDepthIn: 10,
    maxRiserIn: 7.75,
    stringers: 3,
    treadThickIn: 1.00,
    topLandingThickIn: 1.00,
    nosingIn: 1.00,
    kerfIn: 0.125,
    topTread: false
  });

  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function normalizeNumber(value, fallback) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function computeStair(input) {
    const sanitized = {
      totalRiseIn: normalizeNumber(input.totalRiseIn, DEFAULTS.totalRiseIn),
      treadDepthIn: normalizeNumber(input.treadDepthIn, DEFAULTS.treadDepthIn),
      maxRiserIn: normalizeNumber(input.maxRiserIn, DEFAULTS.maxRiserIn),
      stringers: normalizeNumber(input.stringers, DEFAULTS.stringers),
      treadThickIn: normalizeNumber(input.treadThickIn, DEFAULTS.treadThickIn),
      topLandingThickIn: normalizeNumber(input.topLandingThickIn, DEFAULTS.topLandingThickIn),
      nosingIn: normalizeNumber(input.nosingIn, DEFAULTS.nosingIn),
      kerfIn: normalizeNumber(input.kerfIn, DEFAULTS.kerfIn),
      topTread: Boolean(input.topTread)
    };

    const effectiveRiseIn = Math.max(0.001, sanitized.totalRiseIn - (sanitized.topTread ? 0 : sanitized.topLandingThickIn));
    const risers = Math.max(1, Math.ceil(effectiveRiseIn / sanitized.maxRiserIn));
    const finishedRiserIn = effectiveRiseIn / risers;
    const treads = sanitized.topTread ? risers : Math.max(0, risers - 1);
    const totalRunCutIn = sanitized.treadDepthIn * treads;
    const totalRunFinishedIn = totalRunCutIn + (sanitized.nosingIn * treads);
    const stringerLenIn = Math.hypot(totalRunCutIn, effectiveRiseIn);
    const stepHypIn = Math.hypot(sanitized.treadDepthIn, finishedRiserIn);
    const starterPlumbCutIn = finishedRiserIn;
    const seatCutIn = sanitized.treadDepthIn;
    const finishPlumbCutIn = finishedRiserIn;
    const blankLenRequiredIn = stringerLenIn + sanitized.kerfIn * 2;

    const spacing = [];
    const stringers = clampNumber(parseInt(sanitized.stringers, 10) || DEFAULTS.stringers, 1, 12);
    if (stringers >= 2) {
      const step = ASSUMED_STAIR_WIDTH_IN / (stringers - 1);
      for (let k = 0; k < stringers; k += 1) {
        spacing.push(k * step);
      }
    } else {
      spacing.push(ASSUMED_STAIR_WIDTH_IN / 2);
    }

    return {
      ...sanitized,
      stringers,
      effectiveRiseIn,
      risers,
      treads,
      finishedRiserIn,
      totalRunCutIn,
      totalRunFinishedIn,
      stringerLenIn,
      stepHypIn,
      starterPlumbCutIn,
      seatCutIn,
      finishPlumbCutIn,
      blankLenRequiredIn,
      spacing
    };
  }

  return { ASSUMED_STAIR_WIDTH_IN, DEFAULTS, computeStair };
}));
