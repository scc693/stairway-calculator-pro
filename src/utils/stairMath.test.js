import { describe, it, expect } from 'vitest';
import { calculateStairs, formatDimension } from './stairMath';

describe('calculateStairs', () => {
  it('calculates simple standard stairs correctly', () => {
    // 108" total rise (9 feet), target 7.5" rise
    // 108 / 7.5 = 14.4 -> rounds to 14 steps
    // 108 / 14 = 7.714" rise per step
    const result = calculateStairs(108, 0, 7.5, 10);

    expect(result.numberOfSteps).toBe(14);
    expect(result.risePerStep).toBeCloseTo(7.714, 3);
    expect(result.numberOfTreads).toBe(13);
    // Flexible run: 10 * 13 = 130
    expect(result.totalRun).toBe(130);
  });

  it('handles fixed total run correctly', () => {
    // 108" rise, 140" fixed run
    // Steps = 14
    // Run per step = 140 / 13 = 10.769
    const result = calculateStairs(108, 140, 7.5, 10);
    expect(result.numberOfSteps).toBe(14);
    expect(result.runPerStep).toBeCloseTo(10.769, 3);
  });

  it('calculates angle correctly', () => {
    // 3-4-5 triangle (rise 3, run 4)
    // angle = atan(3/4) = 36.87 degrees
    const result = calculateStairs(30, 40, 30, 40); // 1 step
    expect(result.angleDegrees).toBeCloseTo(36.87, 2);
  });
});

describe('formatDimension', () => {
  it('formats whole numbers', () => {
    expect(formatDimension(12)).toBe('12"');
  });

  it('formats halves', () => {
    expect(formatDimension(12.5)).toBe('12 1/2"');
  });

  it('formats quarters', () => {
    expect(formatDimension(5.25)).toBe('5 1/4"');
  });

  it('formats sixteenths', () => {
    expect(formatDimension(5.0625)).toBe('5 1/16"');
  });

  it('handles zero', () => {
    expect(formatDimension(0)).toBe('0"');
  });
});
