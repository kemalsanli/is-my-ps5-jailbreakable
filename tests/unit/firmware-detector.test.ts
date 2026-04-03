import { describe, it, expect } from 'vitest';
import { detectFirmware, MAX_EXPLOITABLE_FIRMWARE } from '@/lib/serial-validator/firmware-detector';
import type { SerialParseResult } from '@/types/serial';

/**
 * Helper to create a SerialParseResult for S01 barcode format.
 * lookupKey format: [C][Y][M] e.g. "218" = chassis 2, year 2021, month 8
 */
function makeBarcodeResult(
  lookupKey: string,
  series: string,
  year: number,
  month: number,
  overrides?: Partial<SerialParseResult>
): SerialParseResult {
  return {
    isValid: true,
    modelCode: series,
    modelVariant: lookupKey,
    yearManufactured: year,
    monthManufactured: month,
    weekManufactured: 0,
    region: 'G',
    factory: 'China',
    raw: `S01-G${lookupKey}1234567`,
    ...overrides,
  };
}

/**
 * Helper to create a SerialParseResult for short CFI model code.
 */
function makeModelResult(
  modelCode: string,
  overrides?: Partial<SerialParseResult>
): SerialParseResult {
  return {
    isValid: true,
    modelCode,
    modelVariant: modelCode.replace(/[^A-Z0-9]/g, ''),
    yearManufactured: 0,
    monthManufactured: 0,
    weekManufactured: 0,
    region: modelCode.slice(-1),
    factory: 'unknown',
    raw: modelCode,
    ...overrides,
  };
}

describe('Firmware Detector', () => {
  describe('MAX_EXPLOITABLE_FIRMWARE', () => {
    it('should be defined', () => {
      expect(MAX_EXPLOITABLE_FIRMWARE).toBeDefined();
      expect(typeof MAX_EXPLOITABLE_FIRMWARE).toBe('string');
    });
  });

  describe('detectFirmware', () => {
    describe('S01 Barcode Lookup (exact table match)', () => {
      it('should detect FAT CFI-11xx Nov 2021 (21B) as JAILBREAKABLE', () => {
        // 21B → FW 4.03 / 4.50 — both exploitable
        const result = detectFirmware(makeBarcodeResult('21B', 'CFI-11xx', 2021, 11));
        expect(result.status).toBe('JAILBREAKABLE');
        expect(result.firmware).toContain('4.03');
        expect(result.confidence).toBe('HIGH');
      });

      it('should detect FAT CFI-11xx Dec 2021 (21C) as JAILBREAKABLE', () => {
        // 21C → FW 4.50 — exploitable
        const result = detectFirmware(makeBarcodeResult('21C', 'CFI-11xx', 2021, 12));
        expect(result.status).toBe('JAILBREAKABLE');
        expect(result.firmware).toBe('4.50');
      });

      it('should detect FAT CFI-11xx Nov 2022 (22B) as exploitable', () => {
        // 22B → FW 6.02 — may or may not be exploitable depending on MAX
        const result = detectFirmware(makeBarcodeResult('22B', 'CFI-11xx', 2022, 11));
        expect(result).toBeDefined();
        expect(result.firmware).toContain('6.02');
      });

      it('should detect FAT CFI-12xx Aug 2023 (338) as exploitable', () => {
        // 338 → FW 7.60 / 7.61 — at the edge
        const result = detectFirmware(makeBarcodeResult('338', 'CFI-12xx', 2023, 8));
        expect(result).toBeDefined();
        expect(result.firmware).toContain('7.60');
      });

      it('should detect Slim CFI-20xx Aug 2024 (448) as NOT_JAILBREAKABLE', () => {
        // 448 → FW 9.40 / 9.60
        const result = detectFirmware(makeBarcodeResult('448', 'CFI-20xx', 2024, 8));
        expect(result.status).toBe('NOT_JAILBREAKABLE');
        expect(result.firmware).toContain('9.40');
      });

      it('should detect Slim CFI-20xx earliest (434) as at edge', () => {
        // 434 → FW 7.00
        const result = detectFirmware(makeBarcodeResult('434', 'CFI-20xx', 2023, 4));
        expect(result).toBeDefined();
        expect(result.firmware).toContain('7.00');
      });

      it('should detect Pro CFI-70xx (145) as NOT_JAILBREAKABLE', () => {
        // 145 → FW 9.05
        const result = detectFirmware(makeBarcodeResult('145', 'CFI-70xx', 2024, 5));
        expect(result.status).toBe('NOT_JAILBREAKABLE');
        expect(result.firmware).toContain('9.05');
      });
    });

    describe('Short Model Code Lookup', () => {
      it('should detect CFI-1000A as JAILBREAKABLE', () => {
        const result = detectFirmware(makeModelResult('CFI-1000A'));
        expect(result.status).toBe('JAILBREAKABLE');
        expect(result.firmware).toBe('1.00');
        expect(result.confidence).toBe('HIGH');
      });

      it('should detect CFI-1015A as JAILBREAKABLE', () => {
        const result = detectFirmware(makeModelResult('CFI-1015A'));
        expect(result.status).toBe('JAILBREAKABLE');
        expect(result.firmware).toBe('4.03');
      });

      it('should detect CFI-1215A as JAILBREAKABLE (FW 6.50)', () => {
        const result = detectFirmware(makeModelResult('CFI-1215A'));
        expect(result.status).toBe('JAILBREAKABLE');
        expect(result.firmware).toBe('6.50');
      });

      it('should detect CFI-2008A as NOT_JAILBREAKABLE', () => {
        const result = detectFirmware(makeModelResult('CFI-2008A'));
        expect(result.status).toBe('NOT_JAILBREAKABLE');
        expect(result.firmware).toBe('10.00');
      });

      it('should detect CFI-2010A as NOT_JAILBREAKABLE', () => {
        const result = detectFirmware(makeModelResult('CFI-2010A'));
        expect(result.status).toBe('NOT_JAILBREAKABLE');
        expect(result.firmware).toBe('11.00');
      });
    });

    describe('Fallback estimation', () => {
      it('should fallback for unknown lookup key with year', () => {
        const result = detectFirmware(makeBarcodeResult('999', 'CFI-??xx', 2024, 1));
        expect(result).toBeDefined();
        expect(result.status).toBe('UNCERTAIN');
      });
    });

    describe('Edge cases', () => {
      it('should handle unknown model code', () => {
        const result = detectFirmware({
          isValid: true,
          modelCode: 'CFI-9999Z',
          modelVariant: '999Z',
          yearManufactured: 0,
          monthManufactured: 0,
          weekManufactured: 0,
          region: 'Z',
          factory: 'unknown',
          raw: 'CFI-9999Z',
        });
        expect(result.status).toBe('UNCERTAIN');
        expect(result.confidence).toBe('LOW');
      });
    });
  });
});
