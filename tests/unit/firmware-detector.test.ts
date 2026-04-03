import { describe, it, expect } from 'vitest';
import { detectFirmware, MAX_EXPLOITABLE_FIRMWARE } from '@/lib/serial-validator/firmware-detector';
import type { SerialParseResult } from '@/types/serial';

function makeSerialResult(
  year: number,
  month: number,
  overrides?: Partial<SerialParseResult>
): SerialParseResult {
  return {
    isValid: true,
    modelCode: 'CFI-1000',
    modelVariant: '1000',
    yearManufactured: year,
    monthManufactured: month,
    weekManufactured: 1,
    region: 'A',
    factory: 'W',
    raw: 'TEST',
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
    it('should detect 2020 units as JAILBREAKABLE with HIGH confidence', () => {
      const result = detectFirmware(makeSerialResult(2020, 6));
      expect(result.status).toBe('JAILBREAKABLE');
      expect(result.confidence).toBe('HIGH');
      expect(result.firmware).toBe('2.50');
    });

    it('should detect 2021 units as JAILBREAKABLE with HIGH confidence', () => {
      const result = detectFirmware(makeSerialResult(2021, 1));
      expect(result.status).toBe('JAILBREAKABLE');
      expect(result.confidence).toBe('HIGH');
      expect(result.firmware).toBe('4.03');
    });

    it('should detect 2021 units any month as JAILBREAKABLE', () => {
      const resultJan = detectFirmware(makeSerialResult(2021, 1));
      const resultDec = detectFirmware(makeSerialResult(2021, 12));
      expect(resultJan.status).toBe('JAILBREAKABLE');
      expect(resultDec.status).toBe('JAILBREAKABLE');
    });

    it('should detect early 2022 (Jan-Mar) as JAILBREAKABLE', () => {
      const resultJan = detectFirmware(makeSerialResult(2022, 1));
      const resultMar = detectFirmware(makeSerialResult(2022, 3));
      expect(resultJan.status).toBe('JAILBREAKABLE');
      expect(resultMar.status).toBe('JAILBREAKABLE');
      expect(resultJan.confidence).toBe('HIGH');
    });

    it('should detect mid 2022 (Apr-Jun) as JAILBREAKABLE with MEDIUM confidence', () => {
      const result = detectFirmware(makeSerialResult(2022, 5));
      expect(result.status).toBe('JAILBREAKABLE');
      expect(result.confidence).toBe('MEDIUM');
    });

    it('should detect late 2022 (Jul-Sep) as JAILBREAKABLE with MEDIUM confidence', () => {
      const result = detectFirmware(makeSerialResult(2022, 8));
      expect(result.status).toBe('JAILBREAKABLE');
      expect(result.confidence).toBe('MEDIUM');
    });

    it('should detect very late 2022 (Oct-Dec) as UNCERTAIN', () => {
      const result = detectFirmware(makeSerialResult(2022, 11));
      expect(result.status).toBe('UNCERTAIN');
      expect(result.confidence).toBe('LOW');
    });

    it('should detect early 2023 as UNCERTAIN', () => {
      const result = detectFirmware(makeSerialResult(2023, 2));
      expect(result.status).toBe('UNCERTAIN');
      expect(result.confidence).toBe('LOW');
    });

    it('should detect late 2024 as NOT_JAILBREAKABLE', () => {
      const result = detectFirmware(makeSerialResult(2024, 9));
      expect(result.status).toBe('NOT_JAILBREAKABLE');
      expect(result.confidence).toBe('HIGH');
    });

    it('should detect 2025+ as NOT_JAILBREAKABLE', () => {
      const result = detectFirmware(makeSerialResult(2025, 1));
      expect(result.status).toBe('NOT_JAILBREAKABLE');
      expect(result.confidence).toBe('HIGH');
    });

    it('should include model code in result', () => {
      const result = detectFirmware(makeSerialResult(2021, 6));
      expect(result.modelCode).toBe('CFI-1000');
    });

    it('should include region in result', () => {
      const result = detectFirmware(makeSerialResult(2021, 6));
      expect(result.region).toBe('A');
    });

    it('should include year in result', () => {
      const result = detectFirmware(makeSerialResult(2021, 6));
      expect(result.yearManufactured).toBe(2021);
    });

    it('should provide a description', () => {
      const result = detectFirmware(makeSerialResult(2021, 6));
      expect(result.description).toBeTruthy();
      expect(result.description.length).toBeGreaterThan(0);
    });

    it('should handle edge case: unknown future year', () => {
      const result = detectFirmware(makeSerialResult(2030, 6));
      expect(result.status).toBe('NOT_JAILBREAKABLE');
    });
  });
});
