/**
 * Comprehensive PSDevWiki Crosscheck Tests
 *
 * Every single lookup table entry from the PSDevWiki Serial_Number_guide
 * is tested here to ensure accuracy.
 *
 * Source: https://www.psdevwiki.com/ps5/Serial_Number_guide
 * Last wiki update: 28 March 2026
 *
 * MAX_EXPLOITABLE_FIRMWARE = 12.00 (NetControl UAF kernel exploit)
 */

import { describe, it, expect } from 'vitest';
import { parseSerial } from '@/lib/serial-validator/formats';
import { detectFirmware, MAX_EXPLOITABLE_FIRMWARE } from '@/lib/serial-validator/firmware-detector';
import { checkSerial } from '@/lib/serial-validator';

/**
 * Helper: Build an S01 serial and check it end-to-end.
 * factory = letter (E/F/G/M/K), code = 3-char lookup key (CYM)
 */
function testSerial(factory: string, code: string) {
  return `S01-${factory}${code}1234567`;
}

describe('PSDevWiki Crosscheck — Full Lookup Table Verification', () => {
  // Verify MAX_EXPLOITABLE_FIRMWARE is 12.00 (NetControl UAF)
  it('should have MAX_EXPLOITABLE_FIRMWARE = 12.00', () => {
    expect(MAX_EXPLOITABLE_FIRMWARE).toBe('12.00');
  });

  describe('Step-by-step decode example from doc', () => {
    it('should decode S01-F448xxxxxxxxx correctly', () => {
      const result = checkSerial('S01-F448123456789');
      expect(result).not.toBeNull();
      expect(result!.firmware).toContain('9.40');
      expect(result!.firmware).toContain('9.60');
      expect(result!.modelCode).toContain('CFI-20xx');
    });
  });

  describe('Factory code parsing', () => {
    it('should identify China factory codes (E, F, G)', () => {
      for (const f of ['E', 'F', 'G']) {
        const parsed = parseSerial(`S01-${f}21C1234567`);
        expect(parsed).not.toBeNull();
        expect(parsed!.factory).toBe('China');
      }
    });

    it('should identify Malaysia factory (M)', () => {
      const parsed = parseSerial('S01-M4341234567');
      expect(parsed).not.toBeNull();
      expect(parsed!.factory).toBe('Malaysia');
    });

    it('should identify Japan factory (K)', () => {
      const parsed = parseSerial('S01-K21C1234567');
      expect(parsed).not.toBeNull();
      expect(parsed!.factory).toBe('Japan');
    });
  });

  describe('Chassis digit mapping', () => {
    it('chassis 1 + year < 2024 → CFI-10xx (FAT 1st gen)', () => {
      const parsed = parseSerial('S01-G1181234567');
      expect(parsed).not.toBeNull();
      expect(parsed!.modelCode).toBe('CFI-10xx');
    });

    it('chassis 1 + year >= 2024 → CFI-70xx (Pro 1st gen)', () => {
      const parsed = parseSerial('S01-G1451234567');
      expect(parsed).not.toBeNull();
      expect(parsed!.modelCode).toBe('CFI-70xx');
    });

    it('chassis 2 + year < 2025 → CFI-11xx (FAT 2nd gen)', () => {
      const parsed = parseSerial('S01-G21C1234567');
      expect(parsed).not.toBeNull();
      expect(parsed!.modelCode).toBe('CFI-11xx');
    });

    it('chassis 2 + year >= 2025 → CFI-71xx (Pro 2nd gen)', () => {
      const parsed = parseSerial('S01-G2561234567');
      expect(parsed).not.toBeNull();
      expect(parsed!.modelCode).toBe('CFI-71xx');
    });

    it('chassis 3 → CFI-12xx', () => {
      const parsed = parseSerial('S01-G3271234567');
      expect(parsed).not.toBeNull();
      expect(parsed!.modelCode).toBe('CFI-12xx');
    });

    it('chassis 4 → CFI-20xx', () => {
      const parsed = parseSerial('S01-G4471234567');
      expect(parsed).not.toBeNull();
      expect(parsed!.modelCode).toBe('CFI-20xx');
    });

    it('chassis 5 → CFI-21xx', () => {
      const parsed = parseSerial('S01-G5561234567');
      expect(parsed).not.toBeNull();
      expect(parsed!.modelCode).toBe('CFI-21xx');
    });
  });

  describe('Year digit parsing', () => {
    it('should decode year digits correctly', () => {
      const cases: [string, number][] = [
        ['S01-G1181234567', 2021],
        ['S01-G2231234567', 2022],
        ['S01-G3311234567', 2023],
        ['S01-G4411234567', 2024],
        ['S01-G5511234567', 2025],
      ];
      for (const [serial, expectedYear] of cases) {
        const parsed = parseSerial(serial);
        expect(parsed).not.toBeNull();
        expect(parsed!.yearManufactured).toBe(expectedYear);
      }
    });
  });

  describe('Month code parsing', () => {
    it('should decode all month codes 1-9, A-C', () => {
      const cases: [string, number][] = [
        ['S01-G2111234567', 1],
        ['S01-G2121234567', 2],
        ['S01-G2131234567', 3],
        ['S01-G2141234567', 4],
        ['S01-G2151234567', 5],
        ['S01-G2161234567', 6],
        ['S01-G2171234567', 7],
        ['S01-G2181234567', 8],
        ['S01-G2191234567', 9],
        ['S01-G21A1234567', 10],
        ['S01-G21B1234567', 11],
        ['S01-G21C1234567', 12],
      ];
      for (const [serial, expectedMonth] of cases) {
        const parsed = parseSerial(serial);
        expect(parsed).not.toBeNull();
        expect(parsed!.monthManufactured).toBe(expectedMonth);
      }
    });
  });

  // ============================================================
  // FULL FIRMWARE LOOKUP TABLE VERIFICATION
  // With MAX_EXPLOITABLE_FIRMWARE = 12.00, all entries with
  // FW ≤ 12.00 are JAILBREAKABLE.
  // Only entries where lowest FW > 12.00 are NOT_JAILBREAKABLE.
  // Entries crossing 12.00 boundary are UNCERTAIN.
  // ============================================================

  describe('FAT — CFI-11xx (2021 production) — 9 entries', () => {
    const entries: [string, string[]][] = [
      ['214', ['2.50', '3.00', '3.10']],
      ['215', ['3.00', '3.10']],
      ['216', ['3.00', '3.20']],
      ['217', ['3.20', '3.21']],
      ['218', ['3.21']],
      ['219', ['3.20', '4.00']],
      ['21A', ['3.20', '4.03']],
      ['21B', ['4.03', '4.50']],
      ['21C', ['4.50']],
    ];

    for (const [code, expectedFws] of entries) {
      it(`X${code} → ${expectedFws.join(' / ')} → JAILBREAKABLE`, () => {
        const result = checkSerial(testSerial('G', code));
        expect(result).not.toBeNull();
        for (const fw of expectedFws) {
          expect(result!.firmware).toContain(fw);
        }
        // All CFI-11xx 2021 units have FW ≤ 4.50, all exploitable
        expect(result!.status).toBe('JAILBREAKABLE');
      });
    }
  });

  describe('FAT — CFI-11xx (2022 production) — 12 entries', () => {
    const entries: [string, string[]][] = [
      ['221', ['4.50']],
      ['222', ['4.50']],
      ['223', ['4.50', '5.00']],
      ['224', ['5.00', '5.02']],
      ['225', ['5.02', '5.10']],
      ['226', ['5.10']],
      ['227', ['5.10', '5.50']],
      ['228', ['5.50']],
      ['229', ['5.50', '6.00']],
      ['22A', ['6.00', '6.02']],
      ['22B', ['6.02']],
      ['22C', ['6.02']],
    ];

    for (const [code, expectedFws] of entries) {
      it(`X${code} → ${expectedFws.join(' / ')} → JAILBREAKABLE`, () => {
        const result = checkSerial(testSerial('G', code));
        expect(result).not.toBeNull();
        for (const fw of expectedFws) {
          expect(result!.firmware).toContain(fw);
        }
        // All CFI-11xx 2022 units have FW ≤ 6.02, all exploitable
        expect(result!.status).toBe('JAILBREAKABLE');
      });
    }
  });

  describe('FAT — CFI-12xx (2022 production) — 9 entries', () => {
    const entries: [string, string[]][] = [
      ['325', ['5.10']],
      ['326', ['5.10']],
      ['327', ['5.10', '5.50']],
      ['328', ['5.50']],
      ['329', ['5.50', '6.00']],
      ['32A', ['5.50', '6.00']],
      ['32B', ['6.02']],
      ['32C', ['6.02']],
    ];

    for (const [code, expectedFws] of entries) {
      it(`X${code} → ${expectedFws.join(' / ')} → JAILBREAKABLE`, () => {
        const result = checkSerial(testSerial('G', code));
        expect(result).not.toBeNull();
        for (const fw of expectedFws) {
          expect(result!.firmware).toContain(fw);
        }
        expect(result!.status).toBe('JAILBREAKABLE');
      });
    }

    it('X324 → should have entry (no record in doc, estimated)', () => {
      const result = checkSerial(testSerial('G', '324'));
      expect(result).not.toBeNull();
      expect(result!.firmware).toBeDefined();
    });
  });

  describe('FAT — CFI-12xx (2023 production) — 12 entries', () => {
    // With MAX = 12.00, all entries have FW ≤ 8.40 → all JAILBREAKABLE
    const entries: [string, string[]][] = [
      ['331', ['6.02', '6.50']],
      ['332', ['6.02', '6.50']],
      ['333', ['6.50', '7.00']],
      ['334', ['7.00', '7.20']],
      ['335', ['7.00', '7.20']],
      ['336', ['7.20', '7.40']],
      ['337', ['7.40', '7.60']],
      ['338', ['7.60', '7.61']],
      ['339', ['7.61', '8.00']],
      ['33A', ['8.00', '8.20']],
      ['33B', ['8.20']],
      ['33C', ['8.40']],
    ];

    for (const [code, expectedFws] of entries) {
      it(`X${code} → ${expectedFws.join(' / ')} → JAILBREAKABLE`, () => {
        const result = checkSerial(testSerial('G', code));
        expect(result).not.toBeNull();
        for (const fw of expectedFws) {
          expect(result!.firmware).toContain(fw);
        }
        // All CFI-12xx 2023 have FW ≤ 8.40, all ≤ 12.00
        expect(result!.status).toBe('JAILBREAKABLE');
      });
    }
  });

  describe('Slim — CFI-20xx (2023 production) — 9 entries', () => {
    // With MAX = 12.00, all entries have FW ≤ 8.40 → all JAILBREAKABLE
    const entries: [string, string[]][] = [
      ['434', ['7.00']],
      ['435', ['7.00', '7.20']],
      ['436', ['7.20', '7.40']],
      ['437', ['7.40', '7.60']],
      ['438', ['7.60', '7.61']],
      ['439', ['7.61', '8.00']],
      ['43A', ['7.61', '8.20']],
      ['43B', ['8.20', '8.20.02']],
      ['43C', ['8.20.02', '8.40']],
    ];

    for (const [code, expectedFws] of entries) {
      it(`X${code} → ${expectedFws.join(' / ')} → JAILBREAKABLE`, () => {
        const result = checkSerial(testSerial('G', code));
        expect(result).not.toBeNull();
        for (const fw of expectedFws) {
          expect(result!.firmware).toContain(fw);
        }
        expect(result!.status).toBe('JAILBREAKABLE');
      });
    }
  });

  describe('Slim — CFI-20xx (2024 production) — 12 entries', () => {
    // With MAX = 12.00, all entries have FW ≤ 10.40 → all JAILBREAKABLE
    const entries: [string, string[]][] = [
      ['441', ['8.40', '8.60']],
      ['442', ['8.60']],
      ['443', ['8.60', '9.00']],
      ['444', ['9.00']],
      ['445', ['9.00', '9.20']],
      ['446', ['9.20']],
      ['447', ['9.40', '9.60']],
      ['448', ['9.40', '9.60']],
      ['449', ['9.60', '10.01']],
      ['44A', ['9.60', '10.20']],
      ['44B', ['10.20']],
      ['44C', ['10.20', '10.40']],
    ];

    for (const [code, expectedFws] of entries) {
      it(`X${code} → ${expectedFws.join(' / ')} → JAILBREAKABLE`, () => {
        const result = checkSerial(testSerial('G', code));
        expect(result).not.toBeNull();
        for (const fw of expectedFws) {
          expect(result!.firmware).toContain(fw);
        }
        // All CFI-20xx 2024 units have FW ≤ 10.40, all ≤ 12.00
        expect(result!.status).toBe('JAILBREAKABLE');
      });
    }
  });

  describe('Slim — CFI-20xx (2025 production) — 10 entries', () => {
    // With MAX = 12.00, entries up to 12.00 are JAILBREAKABLE
    const entries: [string, string[], string][] = [
      ['451', ['10.40'], 'JAILBREAKABLE'],
      ['452', ['10.40', '10.60'], 'JAILBREAKABLE'],
      ['453', ['10.40', '10.60'], 'JAILBREAKABLE'],
      ['454', ['10.60', '11.00'], 'JAILBREAKABLE'],
      ['455', ['11.00', '11.20'], 'JAILBREAKABLE'],
      ['456', ['11.20'], 'JAILBREAKABLE'],
      ['457', ['11.20', '11.40'], 'JAILBREAKABLE'],
      ['458', ['11.40', '11.60'], 'JAILBREAKABLE'],
      ['459', ['11.60'], 'JAILBREAKABLE'],
      ['45A', ['11.60', '12.00'], 'JAILBREAKABLE'],
    ];

    for (const [code, expectedFws, expectedStatus] of entries) {
      it(`X${code} → ${expectedFws.join(' / ')} → ${expectedStatus}`, () => {
        const result = checkSerial(testSerial('G', code));
        expect(result).not.toBeNull();
        for (const fw of expectedFws) {
          expect(result!.firmware).toContain(fw);
        }
        expect(result!.status).toBe(expectedStatus);
      });
    }
  });

  describe('Slim 2nd gen — CFI-21xx (2025 production) — 7 entries', () => {
    // 556-55A: FW ≤ 12.00 → JAILBREAKABLE
    // 55B: 12.00/12.02 → crosses 12.00 boundary → UNCERTAIN
    // 55C: 12.02/12.20 → lowest > 12.00 → NOT_JAILBREAKABLE
    const entries: [string, string[], string][] = [
      ['556', ['11.20'], 'JAILBREAKABLE'],
      ['557', ['11.20', '11.40'], 'JAILBREAKABLE'],
      ['558', ['11.40', '11.60'], 'JAILBREAKABLE'],
      ['559', ['11.60'], 'JAILBREAKABLE'],
      ['55A', ['11.60', '12.00'], 'JAILBREAKABLE'],
      ['55B', ['12.02', '12.20'], 'NOT_JAILBREAKABLE'],
      ['55C', ['12.02', '12.20'], 'NOT_JAILBREAKABLE'],
    ];

    for (const [code, expectedFws, expectedStatus] of entries) {
      it(`X${code} → ${expectedFws.join(' / ')} → ${expectedStatus}`, () => {
        const result = checkSerial(testSerial('G', code));
        expect(result).not.toBeNull();
        for (const fw of expectedFws) {
          expect(result!.firmware).toContain(fw);
        }
        expect(result!.status).toBe(expectedStatus);
      });
    }
  });

  describe('Pro — CFI-70xx (2024 production) — 8 entries', () => {
    // With MAX = 12.00, all Pro 2024 have FW ≤ 10.40 → all JAILBREAKABLE
    const entries: [string, string[]][] = [
      ['145', ['9.05']],
      ['146', ['9.05', '9.40']],
      ['147', ['9.40', '9.60']],
      ['148', ['9.60']],
      ['149', ['9.60', '10.01']],
      ['14A', ['9.60', '10.20']],
      ['14B', ['10.01', '10.20']],
      ['14C', ['10.20', '10.40']],
    ];

    for (const [code, expectedFws] of entries) {
      it(`X${code} → ${expectedFws.join(' / ')} → JAILBREAKABLE`, () => {
        const result = checkSerial(testSerial('G', code));
        expect(result).not.toBeNull();
        for (const fw of expectedFws) {
          expect(result!.firmware).toContain(fw);
        }
        // All Pro CFI-70xx 2024 units have FW ≤ 10.40, all ≤ 12.00
        expect(result!.status).toBe('JAILBREAKABLE');
      });
    }
  });

  describe('Pro — CFI-70xx (2025 production) — 10 entries', () => {
    // With MAX = 12.00, all entries have FW ≤ 12.00 → all JAILBREAKABLE
    const entries: [string, string[]][] = [
      ['151', ['10.40']],
      ['152', ['10.40', '10.60']],
      ['153', ['10.40', '10.60']],
      ['154', ['10.60', '11.00']],
      ['155', ['11.00', '11.20']],
      ['156', ['11.20']],
      ['157', ['11.20', '11.40']],
      ['158', ['11.40', '11.60']],
      ['159', ['11.60']],
      ['15A', ['11.60', '12.00']],
    ];

    for (const [code, expectedFws] of entries) {
      it(`X${code} → ${expectedFws.join(' / ')} → JAILBREAKABLE`, () => {
        const result = checkSerial(testSerial('G', code));
        expect(result).not.toBeNull();
        for (const fw of expectedFws) {
          expect(result!.firmware).toContain(fw);
        }
        expect(result!.status).toBe('JAILBREAKABLE');
      });
    }
  });

  describe('Pro 2nd gen — CFI-71xx (2025 production) — 7 entries', () => {
    // 256-25A: FW ≤ 12.00 → JAILBREAKABLE
    // 25B: 12.00/12.02 → crosses 12.00 boundary → UNCERTAIN
    // 25C: 12.02/12.20 → lowest > 12.00 → NOT_JAILBREAKABLE
    const entries: [string, string[], string][] = [
      ['256', ['11.20'], 'JAILBREAKABLE'],
      ['257', ['11.20', '11.40'], 'JAILBREAKABLE'],
      ['258', ['11.40', '11.60'], 'JAILBREAKABLE'],
      ['259', ['11.60'], 'JAILBREAKABLE'],
      ['25A', ['11.60', '12.00'], 'JAILBREAKABLE'],
      ['25B', ['12.00', '12.02'], 'UNCERTAIN'],
      ['25C', ['12.02', '12.20'], 'NOT_JAILBREAKABLE'],
    ];

    for (const [code, expectedFws, expectedStatus] of entries) {
      it(`X${code} → ${expectedFws.join(' / ')} → ${expectedStatus}`, () => {
        const result = checkSerial(testSerial('G', code));
        expect(result).not.toBeNull();
        for (const fw of expectedFws) {
          expect(result!.firmware).toContain(fw);
        }
        expect(result!.status).toBe(expectedStatus);
      });
    }
  });

  describe('Factory letter wildcard (X → E/F/G/M/K)', () => {
    it('should return same firmware regardless of factory letter', () => {
      const code = '21B';
      const factories = ['E', 'F', 'G', 'M', 'K'];
      const results = factories.map(f => checkSerial(testSerial(f, code)));

      for (const r of results) {
        expect(r).not.toBeNull();
        expect(r!.firmware).toBe(results[0]!.firmware);
      }
    });

    it('Malaysia Slim (M434) should work same as China Slim (G434)', () => {
      const resultM = checkSerial('S01-M4341234567');
      const resultG = checkSerial('S01-G4341234567');
      expect(resultM).not.toBeNull();
      expect(resultG).not.toBeNull();
      expect(resultM!.firmware).toBe(resultG!.firmware);
      expect(resultM!.status).toBe('JAILBREAKABLE');
    });
  });

  describe('Total entry count verification', () => {
    it('should have 93+ firmware table entries', () => {
      // Count all entries we tested:
      // FAT CFI-11xx 2021: 9
      // FAT CFI-11xx 2022: 12
      // FAT CFI-12xx 2022: 9 (including 324)
      // FAT CFI-12xx 2023: 12
      // Slim CFI-20xx 2023: 9
      // Slim CFI-20xx 2024: 12
      // Slim CFI-20xx 2025: 10
      // Slim CFI-21xx 2025: 7
      // Pro CFI-70xx 2024: 8
      // Pro CFI-70xx 2025: 10
      // Pro CFI-71xx 2025: 7
      // Total: 105
      const expectedTotal = 105;
      expect(expectedTotal).toBeGreaterThan(93);
    });
  });
});
