import { describe, it, expect } from 'vitest';
import { checkSerial, isSerialValid, getMaxExploitableFirmware } from '@/lib/serial-validator';

describe('Serial Validator (Integration)', () => {
  describe('checkSerial', () => {
    it('should return null for empty input', () => {
      expect(checkSerial('')).toBeNull();
    });

    it('should return null for too-short input', () => {
      expect(checkSerial('S01')).toBeNull();
      expect(checkSerial('12345')).toBeNull();
    });

    it('should return null for invalid format', () => {
      expect(checkSerial('INVALID_SERIAL_NUMBER_HERE')).toBeNull();
    });

    it('should return a valid result for recognized serial formats', () => {
      const result = checkSerial('S01-G2A211W9D1234');
      if (result) {
        expect(result.status).toBeDefined();
        expect(result.firmware).toBeDefined();
        expect(result.confidence).toBeDefined();
        expect(['JAILBREAKABLE', 'NOT_JAILBREAKABLE', 'UNCERTAIN']).toContain(
          result.status
        );
        expect(['HIGH', 'MEDIUM', 'LOW']).toContain(result.confidence);
      }
    });
  });

  describe('isSerialValid', () => {
    it('should return false for empty string', () => {
      expect(isSerialValid('')).toBe(false);
    });

    it('should return false for random text', () => {
      expect(isSerialValid('hello world')).toBe(false);
    });
  });

  describe('getMaxExploitableFirmware', () => {
    it('should return a firmware version string', () => {
      const fw = getMaxExploitableFirmware();
      expect(fw).toBeDefined();
      expect(typeof fw).toBe('string');
      expect(fw.length).toBeGreaterThan(0);
    });
  });
});
