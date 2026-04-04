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
    it('should be 12.00', () => {
      expect(MAX_EXPLOITABLE_FIRMWARE).toBe('12.00');
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

      it('should detect FAT CFI-11xx Nov 2022 (22B) as JAILBREAKABLE', () => {
        // 22B → FW 6.02 — exploitable (≤ 12.00)
        const result = detectFirmware(makeBarcodeResult('22B', 'CFI-11xx', 2022, 11));
        expect(result.status).toBe('JAILBREAKABLE');
        expect(result.firmware).toContain('6.02');
      });

      it('should detect FAT CFI-12xx Aug 2023 (338) as JAILBREAKABLE', () => {
        // 338 → FW 7.60 / 7.61 — exploitable (≤ 12.00)
        const result = detectFirmware(makeBarcodeResult('338', 'CFI-12xx', 2023, 8));
        expect(result.status).toBe('JAILBREAKABLE');
        expect(result.firmware).toContain('7.60');
      });

      it('should detect Slim CFI-20xx Aug 2024 (448) as JAILBREAKABLE', () => {
        // 448 → FW 9.40 / 9.60 — now exploitable with Lapse kernel exploit (≤ 12.00)
        const result = detectFirmware(makeBarcodeResult('448', 'CFI-20xx', 2024, 8));
        expect(result.status).toBe('JAILBREAKABLE');
        expect(result.firmware).toContain('9.40');
      });

      it('should detect Slim CFI-20xx earliest (434) as JAILBREAKABLE', () => {
        // 434 → FW 7.00 — exploitable
        const result = detectFirmware(makeBarcodeResult('434', 'CFI-20xx', 2023, 4));
        expect(result.status).toBe('JAILBREAKABLE');
        expect(result.firmware).toContain('7.00');
      });

      it('should detect Pro CFI-70xx (145) as JAILBREAKABLE', () => {
        // 145 → FW 9.05 — now exploitable with Lapse kernel exploit
        const result = detectFirmware(makeBarcodeResult('145', 'CFI-70xx', 2024, 5));
        expect(result.status).toBe('JAILBREAKABLE');
        expect(result.firmware).toContain('9.05');
      });

      it('should detect Pro 2nd gen CFI-71xx (25B) as UNCERTAIN', () => {
        // 25B → FW 12.00 / 12.02 — crosses the 12.00 boundary
        const result = detectFirmware(makeBarcodeResult('25B', 'CFI-71xx', 2025, 11));
        expect(result.status).toBe('UNCERTAIN');
        expect(result.firmware).toContain('12.00');
        expect(result.firmware).toContain('12.02');
      });

      it('should detect Pro 2nd gen CFI-71xx (25C) as NOT_JAILBREAKABLE', () => {
        // 25C → FW 12.02 / 12.20 — both > 12.00
        const result = detectFirmware(makeBarcodeResult('25C', 'CFI-71xx', 2025, 12));
        expect(result.status).toBe('NOT_JAILBREAKABLE');
        expect(result.firmware).toContain('12.02');
      });

      it('should detect Slim 2nd gen CFI-21xx (55B) as NOT_JAILBREAKABLE', () => {
        // 55B → FW 12.02 / 12.20 — both > 12.00
        const result = detectFirmware(makeBarcodeResult('55B', 'CFI-21xx', 2025, 11));
        expect(result.status).toBe('NOT_JAILBREAKABLE');
      });
    });

    describe('Detailed jailbreak info', () => {
      it('should return BEST quality for FW 3.00-4.51 range', () => {
        const result = detectFirmware(makeBarcodeResult('21B', 'CFI-11xx', 2021, 11));
        expect(result.jailbreakInfo).toBeDefined();
        expect(result.jailbreakInfo.quality).toBe('BEST');
        expect(result.jailbreakInfo.kernelExploit).toContain('IPV6');
        expect(result.jailbreakInfo.hasFullJB).toBe(true);
        expect(result.jailbreakInfo.exploits.length).toBeGreaterThan(3);
      });

      it('should return GOOD quality for FW 5.00-5.50 range', () => {
        const result = detectFirmware(makeBarcodeResult('226', 'CFI-11xx', 2022, 6));
        expect(result.jailbreakInfo.quality).toBe('GOOD');
        expect(result.jailbreakInfo.kernelExploit).toBe('UMTX');
      });

      it('should return OK quality for FW 6.00-7.61 range', () => {
        const result = detectFirmware(makeBarcodeResult('22A', 'CFI-11xx', 2022, 10));
        expect(result.jailbreakInfo.quality).toBe('OK');
      });

      it('should return OK quality for FW 8.00-10.01 (Lapse exploit)', () => {
        const result = detectFirmware(makeBarcodeResult('441', 'CFI-20xx', 2024, 1));
        expect(result.jailbreakInfo.quality).toBe('OK');
        expect(result.jailbreakInfo.kernelExploit).toBe('Lapse');
      });

      it('should return OK quality for FW 10.20-12.00 (NetControl UAF)', () => {
        const result = detectFirmware(makeBarcodeResult('44B', 'CFI-20xx', 2024, 11));
        expect(result.jailbreakInfo.quality).toBe('OK');
        expect(result.jailbreakInfo.kernelExploit).toBe('NetControl UAF');
      });

      it('should include model type info', () => {
        const result = detectFirmware(makeBarcodeResult('434', 'CFI-20xx', 2023, 4));
        expect(result.modelType).toBe('Slim');
        expect(result.modelName).toBe('CFI-20xx');
      });

      it('should include production info', () => {
        const result = detectFirmware(makeBarcodeResult('434', 'CFI-20xx', 2023, 4));
        expect(result.productionMonthName).toContain('April');
        expect(result.productionMonthName).toContain('2023');
        expect(result.factoryCountry).toBe('China');
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

      it('should detect CFI-2008A as JAILBREAKABLE (FW 10.00, Lapse exploit)', () => {
        // With MAX=12.00, FW 10.00 is exploitable
        const result = detectFirmware(makeModelResult('CFI-2008A'));
        expect(result.status).toBe('JAILBREAKABLE');
        expect(result.firmware).toBe('10.00');
      });

      it('should detect CFI-2010A as JAILBREAKABLE (FW 11.00, NetControl UAF)', () => {
        // With MAX=12.00, FW 11.00 is exploitable
        const result = detectFirmware(makeModelResult('CFI-2010A'));
        expect(result.status).toBe('JAILBREAKABLE');
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
