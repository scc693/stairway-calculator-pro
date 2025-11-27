const assert = require('assert');
const { computeStair, DEFAULTS } = require('../stair-math.js');

function nearlyEqual(actual, expected, epsilon = 1e-9) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= epsilon, `Expected ${actual} to be nearly equal to ${expected}`);
}

(function shouldSubtractTopLandingWhenNotCountingTopTread() {
  const config = {
    ...DEFAULTS,
    totalRiseIn: 110,
    topLandingThickIn: 1.5,
    topTread: false
  };

  const result = computeStair(config);
  nearlyEqual(result.effectiveRiseIn, 108.5);
  assert.strictEqual(result.treads, result.risers - 1, 'treads should be risers - 1 when top tread not counted');
})();

(function shouldCountTopTreadWhenEnabled() {
  const config = {
    ...DEFAULTS,
    totalRiseIn: 96,
    topLandingThickIn: 0.75,
    treadDepthIn: 10.25,
    topTread: true
  };

  const result = computeStair(config);
  assert.strictEqual(result.treads, result.risers, 'treads should equal risers when top tread counted');
  nearlyEqual(result.totalRunCutIn, result.treadDepthIn * result.treads);
})();

(function shouldIncludeKerfInBlankLength() {
  const config = {
    ...DEFAULTS,
    kerfIn: 0.1875,
    treadDepthIn: 9.5,
    totalRiseIn: 104
  };

  const result = computeStair(config);
  nearlyEqual(result.blankLenRequiredIn, result.stringerLenIn + config.kerfIn * 2);
})();

(function shouldGenerateSymmetricSpacingForMultipleStringers() {
  const config = {
    ...DEFAULTS,
    stringers: 4
  };

  const result = computeStair(config);
  assert.deepStrictEqual(result.spacing.map(v => Number(v.toFixed(6))), [0, 12, 24, 36], 'spacing should divide 36" width evenly');
})();

(function shouldSubtractTreadThicknessWhenCountingTopTread() {
  const config = {
    ...DEFAULTS,
    totalRiseIn: 120,
    treadThickIn: 1.25,
    topTread: true
  };

  const result = computeStair(config);
  nearlyEqual(result.effectiveRiseIn, 118.75);
})();

(function shouldAddNosingOnceToTotalRun() {
  const config = {
    ...DEFAULTS,
    totalRiseIn: 108,
    treadDepthIn: 10,
    nosingIn: 1,
    topTread: false
  };

  const result = computeStair(config);
  // With totalRise:108, topLanding:1, maxRiser:7.75 -> effectiveRise:107 -> risers:14 -> treads:13
  // totalRunCutIn = 13 * 10 = 130
  // totalRunFinishedIn = 130 + 1 = 131
  nearlyEqual(result.totalRunFinishedIn, 131);
})();

(function shouldCalculateFinishedRiserBasedOnEffectiveRise() {
  const config = {
    ...DEFAULTS,
    totalRiseIn: 108,
    topLandingThickIn: 1, // effectiveRiseIn will be 107
  };

  const result = computeStair(config);
  // effectiveRise: 107, risers: ceil(107 / 7.75) = 14
  // finishedRiserIn = 107 / 14 = 7.642857...
  nearlyEqual(result.finishedRiserIn, 107 / 14);
})();

(function shouldReturnCorrectRunPerTreadCut() {
    const config = {
        ...DEFAULTS,
        treadDepthIn: 11.5,
    };

    const result = computeStair(config);
    nearlyEqual(result.runPerTreadCutIn, 11.5);
})();

console.log('computeStair tests passed');
