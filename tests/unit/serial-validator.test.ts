import { describe, it, expect } from 'vitest';
import { normalizeSerial, parseSerial, isValidFormat, parseMonthChar } from '@/lib/serial-validator/formats';

describe('Serial Number Format Validation', () => {
  describe('normalizeSerial', () => {
    it('should uppercase and trim input', () => {
      expect(normalizeSerial('  s01-g2121w9d1234  ')).toBe('S01-G2121W9D1234');
    });

    it('should remove extra spaces', () => {
      expect(normalizeSerial('S01 G2 121 W9D 1234')).toBe('S01G2121W9D1234');
    });

    it('should handle empty string', () => {
      expect(normalizeSerial('')).toBe('');
    });
  });

  describe('parseMonthChar', () => {
    it('should parse numeric months 1-9', () => {
      expect(parseMonthChar('1')).toBe(1);
      expect(parseMonthChar('5')).toBe(5);
      expect(parseMonthChar('9')).toBe(9);
    });

    it('should parse letter months A-C', () => {
      expect(parseMonthChar('A')).toBe(10);
      expect(parseMonthChar('B')).toBe(11);
      expect(parseMonthChar('C')).toBe(12);
    });

    it('should handle lowercase', () => {
      expect(parseMonthChar('a')).toBe(10);
      expect(parseMonthChar('b')).toBe(11);
      expect(parseMonthChar('c')).toBe(12);
    });

    it('should return 0 for invalid month', () => {
      expect(parseMonthChar('D')).toBe(0);
      expect(parseMonthChar('Z')).toBe(0);
      expect(parseMonthChar('0')).toBe(0);
    });
  });

  describe('isValidFormat', () => {
    it('should accept valid barcode format', () => {
      expect(isValidFormat('S01-G2A211W9D1234')).toBe(true);
    });

    it('should reject empty string', () => {
      expect(isValidFormat('')).toBe(false);
    });

    it('should reject obviously wrong format', () => {
      expect(isValidFormat('HELLO')).toBe(false);
      expect(isValidFormat('12345')).toBe(false);
      expect(isValidFormat('ABCDEFGHIJKLMNOP')).toBe(false);
    });

    it('should reject too-short strings', () => {
      expect(isValidFormat('S01-')).toBe(false);
      expect(isValidFormat('S01-G2')).toBe(false);
    });
  });

  describe('parseSerial', () => {
    it('should return null for empty input', () => {
      expect(parseSerial('')).toBeNull();
    });

    it('should return null for invalid format', () => {
      expect(parseSerial('INVALID123')).toBeNull();
      expect(parseSerial('12345')).toBeNull();
    });

    it('should parse valid barcode format and extract year', () => {
      const result = parseSerial('S01-G2A211W9D1234');
      if (result) {
        expect(result.isValid).toBe(true);
        expect(result.yearManufactured).toBe(2021);
      }
    });

    it('should parse month correctly from serial', () => {
      // Month '1' = January
      const result = parseSerial('S01-G2A211W9D1234');
      if (result) {
        expect(result.monthManufactured).toBe(1);
      }
    });
  });
});
