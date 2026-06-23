import { describe, it, expect } from 'vitest';
import {
  curvedPath,
  CITIES,
  CROSS_PAIRS,
  findCity,
  getHubs,
  getNonHubs,
} from '../lib/map-utils.js';

describe('curvedPath', () => {
  it('should return an SVG quadratic curve path string', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 100, y: 0 };
    const result = curvedPath(a, b, 1);
    expect(result).toMatch(/^M0 0 Q/);
    expect(result).toContain('100 0');
  });

  it('should produce different control points for sign=1 vs sign=-1', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 100, y: 50 };
    const path1 = curvedPath(a, b, 1);
    const path2 = curvedPath(a, b, -1);
    expect(path1).not.toBe(path2);
  });

  it('should handle same-point inputs without NaN', () => {
    const a = { x: 50, y: 50 };
    const b = { x: 50, y: 50 };
    const result = curvedPath(a, b, 1);
    expect(result).not.toContain('NaN');
    expect(result).toBe('M50 50 Q50 50 50 50');
  });

  it('should handle negative coordinates', () => {
    const a = { x: -10, y: -20 };
    const b = { x: 30, y: 40 };
    const result = curvedPath(a, b, 1);
    expect(result).toMatch(/^M-10 -20 Q/);
    expect(result).toContain('30 40');
    expect(result).not.toContain('NaN');
  });

  it('should cap the offset at 60', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10000, y: 0 };
    const result = curvedPath(a, b, 1);
    // dy=0, so offset perpendicular is purely in y; sign=1 → my = 0 + (dx/dist)*offset*1 = 60
    expect(result).toContain('Q5000 60');
  });

  it('should produce a symmetric midpoint for horizontal line', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 200, y: 0 };
    const result = curvedPath(a, b, 1);
    // midpoint x should be 100, offset applies to y
    const match = result.match(/Q([\d.-]+) ([\d.-]+)/);
    expect(Number(match[1])).toBe(100);
  });
});

describe('CITIES data', () => {
  it('should have 17 cities', () => {
    expect(CITIES).toHaveLength(17);
  });

  it('should have Miami as the only hub', () => {
    const hubs = CITIES.filter(c => c.hub);
    expect(hubs).toHaveLength(1);
    expect(hubs[0].name).toBe('Miami');
  });

  it('every city should have name, lon, lat, and side properties', () => {
    for (const city of CITIES) {
      expect(city).toHaveProperty('name');
      expect(city).toHaveProperty('lon');
      expect(city).toHaveProperty('lat');
      expect(city).toHaveProperty('side');
      expect(typeof city.name).toBe('string');
      expect(typeof city.lon).toBe('number');
      expect(typeof city.lat).toBe('number');
      expect(['left', 'right']).toContain(city.side);
    }
  });

  it('should have São Paulo as the only major non-hub city', () => {
    const majors = CITIES.filter(c => c.major && !c.hub);
    expect(majors).toHaveLength(1);
    expect(majors[0].name).toBe('São Paulo');
    expect(majors[0].latency).toBe('112 ms');
  });

  it('all city names should be unique', () => {
    const names = CITIES.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('all longitudes should be in Western hemisphere', () => {
    for (const city of CITIES) {
      expect(city.lon).toBeLessThan(0);
    }
  });
});

describe('CROSS_PAIRS', () => {
  it('should have 10 cross-traffic route pairs', () => {
    expect(CROSS_PAIRS).toHaveLength(10);
  });

  it('every cross pair should reference valid city names', () => {
    const cityNames = new Set(CITIES.map(c => c.name));
    for (const [a, b] of CROSS_PAIRS) {
      expect(cityNames.has(a), `${a} should be a valid city`).toBe(true);
      expect(cityNames.has(b), `${b} should be a valid city`).toBe(true);
    }
  });

  it('should not contain any self-referencing pairs', () => {
    for (const [a, b] of CROSS_PAIRS) {
      expect(a).not.toBe(b);
    }
  });
});

describe('findCity', () => {
  it('should find Miami by name', () => {
    const miami = findCity('Miami');
    expect(miami).toBeDefined();
    expect(miami.hub).toBe(true);
  });

  it('should find São Paulo by name', () => {
    const sp = findCity('São Paulo');
    expect(sp).toBeDefined();
    expect(sp.major).toBe(true);
  });

  it('should return undefined for unknown city', () => {
    expect(findCity('Atlantis')).toBeUndefined();
  });

  it('should be case-sensitive', () => {
    expect(findCity('miami')).toBeUndefined();
    expect(findCity('MIAMI')).toBeUndefined();
  });
});

describe('getHubs', () => {
  it('should return only hub cities', () => {
    const hubs = getHubs();
    expect(hubs.every(c => c.hub)).toBe(true);
  });

  it('should return Miami', () => {
    const hubs = getHubs();
    expect(hubs.map(c => c.name)).toContain('Miami');
  });
});

describe('getNonHubs', () => {
  it('should return all non-hub cities', () => {
    const nonHubs = getNonHubs();
    expect(nonHubs.every(c => !c.hub)).toBe(true);
  });

  it('should have 16 non-hub cities', () => {
    expect(getNonHubs()).toHaveLength(16);
  });

  it('hubs + nonHubs should equal total cities', () => {
    expect(getHubs().length + getNonHubs().length).toBe(CITIES.length);
  });
});
