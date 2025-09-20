const assert = require('assert');
const { computeStair, DEFAULTS } = require('../stair-math.js');

function nearlyEqual(actual, expected, epsilon = 1e-6) {
  assert(Math.abs(actual - expected) <= epsilon, `${actual} ≉ ${expected}`);
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

console.log('computeStair tests passed');
