/**
 * Paste Handling Tests
 *
 * Tests copy-paste functionality with various input formats
 * including whitespace, zero-width chars, and malformed inputs.
 */

import { describe, it, expect } from 'vitest';
import { formatSerialInput } from '@/lib/serial-validator/formats';

describe('formatSerialInput - Paste Handling', () => {
  describe('Clean pasted serials', () => {
    it('should handle pasted barcode format with dash', () => {
      expect(formatSerialInput('S01-G2A211W9D1234')).toBe('S01-G2A211W9D1234');
    });

    it('should handle pasted barcode format without dash', () => {
      expect(formatSerialInput('S01G2A211W9D1234')).toBe('S01-G2A211W9D1234');
    });

    it('should handle pasted CFI short format', () => {
      expect(formatSerialInput('CFI-1215A')).toBe('CFI-1215A');
      expect(formatSerialInput('CFI1215A')).toBe('CFI-1215A');
    });

    it('should handle pasted CFI long format', () => {
      expect(formatSerialInput('CFI-1015A21W9D1234')).toBe('CFI-1015A21W9D1234');
      expect(formatSerialInput('CFI1015A21W9D1234')).toBe('CFI-1015A21W9D1234');
    });
  });

  describe('Pasted serials with whitespace', () => {
    it('should clean spaces in pasted barcode', () => {
      expect(formatSerialInput('S01 G2A2 11W9 D123 4')).toBe('S01-G2A211W9D1234');
    });

    it('should clean tabs and newlines', () => {
      expect(formatSerialInput('S01\tG2A211W9D1234\n')).toBe('S01-G2A211W9D1234');
    });

    it('should clean mixed whitespace', () => {
      expect(formatSerialInput(' S01  -  G2A211W9D1234  ')).toBe('S01-G2A211W9D1234');
    });
  });

  describe('Pasted serials with special characters', () => {
    it('should remove zero-width characters', () => {
      expect(formatSerialInput('S01\u200B-G2A211W9D1234')).toBe('S01-G2A211W9D1234');
    });

    it('should remove BOM and ZWNJ', () => {
      expect(formatSerialInput('\uFEFFS01-G2A211W9D1234\u200C')).toBe('S01-G2A211W9D1234');
    });

    it('should handle multiple dashes', () => {
      expect(formatSerialInput('S01--G2A211W9D1234')).toBe('S01-G2A211W9D1234');
    });
  });

  describe('Case insensitivity', () => {
    it('should uppercase lowercase pasted serial', () => {
      expect(formatSerialInput('s01-g2a211w9d1234')).toBe('S01-G2A211W9D1234');
      expect(formatSerialInput('cfi-1215a')).toBe('CFI-1215A');
    });

    it('should uppercase mixed case', () => {
      expect(formatSerialInput('s01-G2A211w9D1234')).toBe('S01-G2A211W9D1234');
    });
  });

  describe('Edge cases from user reports', () => {
    it('should handle S01-G2A211W9D1234 (reported issue)', () => {
      const result = formatSerialInput('S01-G2A211W9D1234');
      expect(result).toBe('S01-G2A211W9D1234');
      expect(result.length).toBeGreaterThan(10);
    });

    it('should handle copy-paste with trailing spaces', () => {
      expect(formatSerialInput('S01-G2A211W9D1234   ')).toBe('S01-G2A211W9D1234');
    });

    it('should handle copy-paste with leading spaces', () => {
      expect(formatSerialInput('   S01-G2A211W9D1234')).toBe('S01-G2A211W9D1234');
    });
  });

  describe('Partial input (typing)', () => {
    it('should format as user types S01', () => {
      expect(formatSerialInput('S')).toBe('S');
      expect(formatSerialInput('S0')).toBe('S0');
      expect(formatSerialInput('S01')).toBe('S01');
    });

    it('should add dash after S01', () => {
      expect(formatSerialInput('S01G')).toBe('S01-G');
      expect(formatSerialInput('S01G2')).toBe('S01-G2');
    });

    it('should format CFI as user types', () => {
      expect(formatSerialInput('C')).toBe('C');
      expect(formatSerialInput('CF')).toBe('CF');
      expect(formatSerialInput('CFI')).toBe('CFI');
      expect(formatSerialInput('CFI1')).toBe('CFI-1');
    });
  });

  describe('Invalid/malformed inputs', () => {
    it('should handle empty string', () => {
      expect(formatSerialInput('')).toBe('');
    });

    it('should handle only whitespace', () => {
      expect(formatSerialInput('   ')).toBe('');
    });

    it('should handle only special characters', () => {
      // Dash is preserved in formatSerialInput, only alphanumeric is processed
      expect(formatSerialInput('---')).toBe('---');
    });

    it('should handle numeric-only input', () => {
      expect(formatSerialInput('1234567890')).toBe('1234567890');
    });
  });
});
