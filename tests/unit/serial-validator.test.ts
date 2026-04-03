import { describe, it, expect } from 'vitest';
import { normalizeSerial, parseSerial, isValidFormat, parseMonthChar } from '@/lib/serial-validator/formats';

describe('Serial Number Format Validation', () => {
  describe('normalizeSerial', () => {
    it('should uppercase and trim input', () => {
      expect(normalizeSerial('  s01-g218w9d1234  ')).toBe('S01-G218W9D1234');
    });

    it('should remove spaces', () => {
      expect(normalizeSerial('S01 G218 W9D 1234')).toBe('S01G218W9D1234');
    });
  });

  describe('parseMonthChar', () => {
    it('should parse numeric months 1-9', () => {
      expect(parseMonthChar('1')).toBe(1);
      expect(parseMonthChar('6')).toBe(6);
      expect(parseMonthChar('9')).toBe(9);
    });

    it('should parse letter months A-C', () => {
      expect(parseMonthChar('A')).toBe(10);
      expect(parseMonthChar('B')).toBe(11);
      expect(parseMonthChar('C')).toBe(12);
    });

    it('should return 0 for invalid', () => {
      expect(parseMonthChar('0')).toBe(0);
      expect(parseMonthChar('D')).toBe(0);
    });
  });

  describe('isValidFormat', () => {
    it('should accept valid S01 barcode format', () => {
      // S01-[F][C][Y][M]xxx — F=G, C=2, Y=1, M=8
      expect(isValidFormat('S01-G218123456789')).toBe(true);
    });

    it('should accept S01 with dash', () => {
      expect(isValidFormat('S01-G218123456789')).toBe(true);
    });

    it('should accept valid CFI short format', () => {
      expect(isValidFormat('CFI-1215A')).toBe(true);
      expect(isValidFormat('CFI-1000B')).toBe(true);
    });

    it('should reject too-short strings', () => {
      expect(isValidFormat('S01-')).toBe(false);
      expect(isValidFormat('S01-G')).toBe(false);
    });

    it('should reject empty', () => {
      expect(isValidFormat('')).toBe(false);
    });
  });

  describe('parseSerial', () => {
    it('should parse S01 barcode format correctly', () => {
      // S01-G218123456789 → F=G(China), C=2(CFI-11xx), Y=1(2021), M=8(Aug)
      const result = parseSerial('S01-G218123456789');
      expect(result).not.toBeNull();
      expect(result!.isValid).toBe(true);
      expect(result!.yearManufactured).toBe(2021);
      expect(result!.monthManufactured).toBe(8);
      expect(result!.factory).toBe('China');
      expect(result!.modelVariant).toBe('218');
    });

    it('should parse S01 with month letter', () => {
      // S01-F21B12345678 → F=F(China), C=2, Y=1(2021), M=B(Nov)
      const result = parseSerial('S01-F21B12345678');
      expect(result).not.toBeNull();
      expect(result!.yearManufactured).toBe(2021);
      expect(result!.monthManufactured).toBe(11);
      expect(result!.modelVariant).toBe('21B');
    });

    it('should parse Slim serial (chassis 4)', () => {
      // S01-F44812345678 → F=F(China), C=4(CFI-20xx Slim), Y=4(2024), M=8(Aug)
      const result = parseSerial('S01-F44812345678');
      expect(result).not.toBeNull();
      expect(result!.yearManufactured).toBe(2024);
      expect(result!.monthManufactured).toBe(8);
      expect(result!.modelCode).toBe('CFI-20xx');
    });

    it('should parse Pro serial (chassis 1, year 2024)', () => {
      // S01-G1451234567 → chassis=1, year=2024 → CFI-70xx Pro
      const result = parseSerial('S01-G1451234567');
      expect(result).not.toBeNull();
      expect(result!.modelCode).toBe('CFI-70xx');
      expect(result!.yearManufactured).toBe(2024);
    });

    it('should parse short CFI model code', () => {
      const result = parseSerial('CFI-1215A');
      expect(result).not.toBeNull();
      expect(result!.isValid).toBe(true);
      expect(result!.modelCode).toBe('CFI-1215A');
    });

    it('should identify Malaysia factory', () => {
      const result = parseSerial('S01-M4341234567');
      expect(result).not.toBeNull();
      expect(result!.factory).toBe('Malaysia');
    });

    it('should identify Japan factory', () => {
      const result = parseSerial('S01-K21C1234567');
      expect(result).not.toBeNull();
      expect(result!.factory).toBe('Japan');
    });

    it('should return null for invalid format', () => {
      expect(parseSerial('INVALID')).toBeNull();
      expect(parseSerial('')).toBeNull();
    });
  });
});
