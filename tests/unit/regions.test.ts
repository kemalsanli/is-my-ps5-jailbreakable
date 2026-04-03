import { describe, it, expect } from 'vitest';
import { getRegionInfo, REGIONS, MODEL_CODES } from '@/lib/serial-validator/regions';

describe('Region Detection', () => {
  describe('REGIONS', () => {
    it('should have US region', () => {
      expect(REGIONS.A).toBeDefined();
      expect(REGIONS.A.name).toContain('United States');
    });

    it('should have Japan region', () => {
      expect(REGIONS.J).toBeDefined();
      expect(REGIONS.J.name).toContain('Japan');
    });

    it('should have Europe region', () => {
      expect(REGIONS.C).toBeDefined();
      expect(REGIONS.C.name).toContain('Europe');
    });

    it('should have multiple regions defined', () => {
      expect(Object.keys(REGIONS).length).toBeGreaterThan(5);
    });
  });

  describe('getRegionInfo', () => {
    it('should return US region for code A', () => {
      const region = getRegionInfo('A');
      expect(region).not.toBeNull();
      expect(region!.name).toContain('United States');
      expect(region!.factoryCode).toBe('US');
    });

    it('should return Japan region for code J', () => {
      const region = getRegionInfo('J');
      expect(region).not.toBeNull();
      expect(region!.name).toContain('Japan');
    });

    it('should handle lowercase input', () => {
      const region = getRegionInfo('a');
      expect(region).not.toBeNull();
      expect(region!.name).toContain('United States');
    });

    it('should return null for unknown region code', () => {
      const region = getRegionInfo('X');
      expect(region).toBeNull();
    });

    it('should return null for empty string', () => {
      const region = getRegionInfo('');
      expect(region).toBeNull();
    });
  });

  describe('MODEL_CODES', () => {
    it('should have original PS5 models', () => {
      expect(MODEL_CODES['1000']).toBeDefined();
      expect(MODEL_CODES['1000']).toContain('PS5');
      expect(MODEL_CODES['1000']).toContain('Disc');
    });

    it('should have revision models', () => {
      expect(MODEL_CODES['1100']).toBeDefined();
      expect(MODEL_CODES['1200']).toBeDefined();
    });

    it('should have slim models', () => {
      expect(MODEL_CODES['2000']).toBeDefined();
      expect(MODEL_CODES['2000']).toContain('Slim');
    });

    it('should have multiple models defined', () => {
      expect(Object.keys(MODEL_CODES).length).toBeGreaterThan(10);
    });
  });
});
