/**
 * PS5 Firmware Detector
 *
 * Estimates firmware version based on PS5 serial number components.
 * Based on PSDevWiki Serial Number Guide & MCKUC research.
 *
 * Source: https://www.psdevwiki.com/ps5/Serial_Number_guide
 * Serial format decoded by: MCKUC (YouTube)
 * Firmware data organized by: qtr_703 (Twitter/Discord)
 * Last wiki update: 28 March 2026
 */

import type { SerialParseResult, FirmwareDetectionResult, Confidence } from '@/types/serial';

/**
 * Maximum exploitable firmware version (current known jailbreak ceiling).
 * Update this when new exploits become public.
 */
export const MAX_EXPLOITABLE_FIRMWARE = '7.61';

/**
 * Firmware range lookup table.
 *
 * Key format: "[C][Y][M]" where:
 *   C = chassis digit (1-5)
 *   Y = year digit (1-6)
 *   M = month code (1-9, A-C)
 *
 * In PSDevWiki notation, the factory letter (X) is wildcard and ignored in lookup.
 * Example: "X214" in wiki = key "214" here (chassis=2, year=2021, month=April)
 *
 * Value: array of firmware versions that have been observed.
 * The first element is typically the most likely / lowest firmware.
 */
const FIRMWARE_TABLE: Record<string, { fw: string[]; series: string; estimated?: boolean }> = {
  // --- FAT — CFI-10xx (2020-2021 production, 1st gen) ---
  // Note: CFI-10xx data is sparse in the wiki; use model code DB for these

  // --- FAT — CFI-11xx (2021 production) ---
  '214': { fw: ['2.50', '3.00', '3.10'], series: 'CFI-11xx', estimated: true },
  '215': { fw: ['3.00', '3.10'], series: 'CFI-11xx' },
  '216': { fw: ['3.00', '3.10', '3.20'], series: 'CFI-11xx' },
  '217': { fw: ['3.20', '3.21'], series: 'CFI-11xx' },
  '218': { fw: ['3.21'], series: 'CFI-11xx' },
  '219': { fw: ['3.20', '3.21', '4.00'], series: 'CFI-11xx' },
  '21A': { fw: ['3.20', '4.00', '4.02', '4.03'], series: 'CFI-11xx' },
  '21B': { fw: ['4.03', '4.50'], series: 'CFI-11xx' },
  '21C': { fw: ['4.50'], series: 'CFI-11xx' },

  // --- FAT — CFI-11xx (2022 production) ---
  '221': { fw: ['4.50'], series: 'CFI-11xx' },
  '222': { fw: ['4.50'], series: 'CFI-11xx' },
  '223': { fw: ['4.50', '4.51', '5.00'], series: 'CFI-11xx' },
  '224': { fw: ['5.00', '5.02'], series: 'CFI-11xx' },
  '225': { fw: ['5.02', '5.10'], series: 'CFI-11xx' },
  '226': { fw: ['5.10'], series: 'CFI-11xx' },
  '227': { fw: ['5.10', '5.50'], series: 'CFI-11xx' },
  '228': { fw: ['5.50'], series: 'CFI-11xx' },
  '229': { fw: ['5.50', '6.00'], series: 'CFI-11xx' },
  '22A': { fw: ['6.00', '6.02'], series: 'CFI-11xx' },
  '22B': { fw: ['6.02'], series: 'CFI-11xx' },
  '22C': { fw: ['6.02'], series: 'CFI-11xx' },

  // --- FAT — CFI-12xx (2022 production) ---
  '324': { fw: ['5.10'], series: 'CFI-12xx', estimated: true },
  '325': { fw: ['5.10'], series: 'CFI-12xx' },
  '326': { fw: ['5.10'], series: 'CFI-12xx' },
  '327': { fw: ['5.10', '5.50'], series: 'CFI-12xx' },
  '328': { fw: ['5.50'], series: 'CFI-12xx' },
  '329': { fw: ['5.50', '6.00'], series: 'CFI-12xx' },
  '32A': { fw: ['5.50', '6.00'], series: 'CFI-12xx' },
  '32B': { fw: ['6.02'], series: 'CFI-12xx' },
  '32C': { fw: ['6.02'], series: 'CFI-12xx' },

  // --- FAT — CFI-12xx (2023 production) ---
  '331': { fw: ['6.02', '6.50'], series: 'CFI-12xx' },
  '332': { fw: ['6.02', '6.50'], series: 'CFI-12xx' },
  '333': { fw: ['6.50', '7.00'], series: 'CFI-12xx' },
  '334': { fw: ['7.00', '7.20'], series: 'CFI-12xx' },
  '335': { fw: ['7.00', '7.20'], series: 'CFI-12xx' },
  '336': { fw: ['7.20', '7.40'], series: 'CFI-12xx' },
  '337': { fw: ['7.40', '7.60'], series: 'CFI-12xx' },
  '338': { fw: ['7.60', '7.61'], series: 'CFI-12xx' },
  '339': { fw: ['7.61', '8.00'], series: 'CFI-12xx', estimated: true },
  '33A': { fw: ['8.00', '8.20'], series: 'CFI-12xx', estimated: true },
  '33B': { fw: ['8.20', '8.20.02'], series: 'CFI-12xx', estimated: true },
  '33C': { fw: ['8.20.02', '8.40'], series: 'CFI-12xx', estimated: true },

  // --- Slim — CFI-20xx (2023 production) ---
  '434': { fw: ['7.00'], series: 'CFI-20xx' },
  '435': { fw: ['7.00', '7.20'], series: 'CFI-20xx' },
  '436': { fw: ['7.20', '7.40'], series: 'CFI-20xx' },
  '437': { fw: ['7.40', '7.60'], series: 'CFI-20xx' },
  '438': { fw: ['7.60', '7.61'], series: 'CFI-20xx' },
  '439': { fw: ['7.61', '8.00'], series: 'CFI-20xx' },
  '43A': { fw: ['7.61', '8.00', '8.20'], series: 'CFI-20xx' },
  '43B': { fw: ['8.20', '8.20.02'], series: 'CFI-20xx' },
  '43C': { fw: ['8.20.02', '8.40'], series: 'CFI-20xx' },

  // --- Slim — CFI-20xx (2024 production) ---
  '441': { fw: ['8.40', '8.60'], series: 'CFI-20xx' },
  '442': { fw: ['8.60'], series: 'CFI-20xx' },
  '443': { fw: ['8.60', '9.00'], series: 'CFI-20xx' },
  '444': { fw: ['9.00'], series: 'CFI-20xx' },
  '445': { fw: ['9.00', '9.20'], series: 'CFI-20xx' },
  '446': { fw: ['9.20'], series: 'CFI-20xx' },
  '447': { fw: ['9.40', '9.60'], series: 'CFI-20xx' },
  '448': { fw: ['9.40', '9.60'], series: 'CFI-20xx' },
  '449': { fw: ['9.60', '10.00', '10.01'], series: 'CFI-20xx' },
  '44A': { fw: ['9.60', '10.01', '10.20'], series: 'CFI-20xx' },
  '44B': { fw: ['10.20'], series: 'CFI-20xx' },
  '44C': { fw: ['10.20', '10.40'], series: 'CFI-20xx' },

  // --- Slim — CFI-20xx (2025 production) ---
  '451': { fw: ['10.40'], series: 'CFI-20xx' },
  '452': { fw: ['10.40', '10.60'], series: 'CFI-20xx' },
  '453': { fw: ['10.40', '10.60'], series: 'CFI-20xx' },
  '454': { fw: ['10.60', '11.00'], series: 'CFI-20xx' },
  '455': { fw: ['11.00', '11.20'], series: 'CFI-20xx' },
  '456': { fw: ['11.20'], series: 'CFI-20xx' },
  '457': { fw: ['11.20', '11.40'], series: 'CFI-20xx' },
  '458': { fw: ['11.40', '11.60'], series: 'CFI-20xx' },
  '459': { fw: ['11.60'], series: 'CFI-20xx' },
  '45A': { fw: ['11.60', '12.00'], series: 'CFI-20xx' },

  // --- Slim 2nd gen — CFI-21xx (2025 production) ---
  '556': { fw: ['11.20'], series: 'CFI-21xx' },
  '557': { fw: ['11.20', '11.40'], series: 'CFI-21xx' },
  '558': { fw: ['11.40', '11.60'], series: 'CFI-21xx' },
  '559': { fw: ['11.60'], series: 'CFI-21xx' },
  '55A': { fw: ['11.60', '12.00'], series: 'CFI-21xx' },
  '55B': { fw: ['12.02', '12.20'], series: 'CFI-21xx' },
  '55C': { fw: ['12.02', '12.20'], series: 'CFI-21xx' },

  // --- Pro — CFI-70xx (2024 production, 1st gen Pro) ---
  // Pro shares chassis digit 1 with FAT, distinguished by year >= 2024
  '145': { fw: ['9.05'], series: 'CFI-70xx' },
  '146': { fw: ['9.05', '9.40'], series: 'CFI-70xx' },
  '147': { fw: ['9.40', '9.60'], series: 'CFI-70xx' },
  '148': { fw: ['9.60'], series: 'CFI-70xx' },
  '149': { fw: ['9.60', '10.00', '10.01'], series: 'CFI-70xx' },
  '14A': { fw: ['9.60', '10.00', '10.01', '10.20'], series: 'CFI-70xx' },
  '14B': { fw: ['10.01', '10.20'], series: 'CFI-70xx' },
  '14C': { fw: ['10.20', '10.40'], series: 'CFI-70xx' },

  // --- Pro — CFI-70xx (2025 production) ---
  '151': { fw: ['10.40'], series: 'CFI-70xx' },
  '152': { fw: ['10.40', '10.60'], series: 'CFI-70xx' },
  '153': { fw: ['10.40', '10.60'], series: 'CFI-70xx' },
  '154': { fw: ['10.60', '11.00'], series: 'CFI-70xx' },
  '155': { fw: ['11.00', '11.20'], series: 'CFI-70xx' },
  '156': { fw: ['11.20'], series: 'CFI-70xx' },
  '157': { fw: ['11.20', '11.40'], series: 'CFI-70xx' },
  '158': { fw: ['11.40', '11.60'], series: 'CFI-70xx' },
  '159': { fw: ['11.60'], series: 'CFI-70xx' },
  '15A': { fw: ['11.60', '12.00'], series: 'CFI-70xx' },

  // --- Pro 2nd gen — CFI-71xx (2025 production) ---
  '256': { fw: ['11.20'], series: 'CFI-71xx' },
  '257': { fw: ['11.20', '11.40'], series: 'CFI-71xx' },
  '258': { fw: ['11.40', '11.60'], series: 'CFI-71xx' },
  '259': { fw: ['11.60'], series: 'CFI-71xx' },
  '25A': { fw: ['11.60', '12.00'], series: 'CFI-71xx' },
  '25B': { fw: ['12.00', '12.02'], series: 'CFI-71xx' },
  '25C': { fw: ['12.02', '12.20'], series: 'CFI-71xx' },
};

/**
 * Short model code lookup database.
 * Maps model codes like "CFI-1215A" to approximate firmware.
 */
const MODEL_DB: Record<string, { fw: string; ok: boolean }> = {
  // Original PS5 Disc Edition (CFI-1000 series) — FAT 1st gen
  'CFI-1000A': { fw: '1.00', ok: true },
  'CFI-1000B': { fw: '1.00', ok: true },
  'CFI-1000J': { fw: '1.00', ok: true },
  'CFI-1001A': { fw: '1.50', ok: true },
  'CFI-1010A': { fw: '2.00', ok: true },
  'CFI-1015A': { fw: '4.03', ok: true },
  'CFI-1015B': { fw: '4.03', ok: true },
  'CFI-1015C': { fw: '4.03', ok: true },
  'CFI-1015J': { fw: '4.03', ok: true },
  'CFI-1016A': { fw: '4.03', ok: true },
  'CFI-1016B': { fw: '4.03', ok: true },
  'CFI-1016C': { fw: '4.03', ok: true },
  'CFI-1016J': { fw: '4.03', ok: true },
  'CFI-1017A': { fw: '4.51', ok: true },
  'CFI-1017B': { fw: '4.51', ok: true },
  'CFI-1017C': { fw: '4.51', ok: true },
  'CFI-1018A': { fw: '4.51', ok: true },
  'CFI-1018B': { fw: '4.51', ok: true },
  'CFI-1018C': { fw: '4.51', ok: true },

  // CFI-10xx with higher firmware
  'CFI-1019A': { fw: '5.10', ok: true },
  'CFI-1019B': { fw: '5.10', ok: true },
  'CFI-1020A': { fw: '5.10', ok: true },
  'CFI-1020B': { fw: '5.10', ok: true },
  'CFI-1021A': { fw: '6.20', ok: true },
  'CFI-1021B': { fw: '6.20', ok: true },
  'CFI-1021C': { fw: '6.20', ok: true },
  'CFI-1021J': { fw: '6.20', ok: true },
  'CFI-1022A': { fw: '6.20', ok: true },
  'CFI-1022B': { fw: '6.20', ok: true },
  'CFI-1022C': { fw: '6.20', ok: true },
  'CFI-1023A': { fw: '7.00', ok: true },

  // FAT 3rd gen — CFI-12xx
  'CFI-1200A': { fw: '5.10', ok: true },
  'CFI-1200B': { fw: '5.10', ok: true },
  'CFI-1215A': { fw: '6.50', ok: true },
  'CFI-1215B': { fw: '6.50', ok: true },
  'CFI-1216A': { fw: '7.00', ok: true },
  'CFI-1216B': { fw: '7.00', ok: true },

  // Slim — CFI-20xx — NOT jailbreakable (FW 7.00+)
  'CFI-2000A': { fw: '7.00', ok: true },
  'CFI-2000B': { fw: '7.00', ok: true },
  'CFI-2008A': { fw: '10.00', ok: false },
  'CFI-2008B': { fw: '10.00', ok: false },
  'CFI-2010A': { fw: '11.00', ok: false },
  'CFI-2010B': { fw: '11.00', ok: false },

  // Pro — CFI-70xx
  'CFI-7000A': { fw: '9.05', ok: false },
  'CFI-7000B': { fw: '9.05', ok: false },
};

/**
 * Compare two firmware version strings.
 * Returns negative if a < b, 0 if equal, positive if a > b.
 */
function compareFirmware(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const va = partsA[i] || 0;
    const vb = partsB[i] || 0;
    if (va !== vb) return va - vb;
  }
  return 0;
}

/**
 * Determine if a firmware version is exploitable (≤ MAX_EXPLOITABLE_FIRMWARE).
 */
function isExploitable(fw: string): boolean {
  return compareFirmware(fw, MAX_EXPLOITABLE_FIRMWARE) <= 0;
}

/**
 * Detect firmware and jailbreak status from a parsed serial number.
 */
export function detectFirmware(
  parsed: SerialParseResult
): FirmwareDetectionResult {
  // First, try the short model DB lookup (for CFI-XXXXR format)
  const modelKey = parsed.modelCode;
  const modelMatch = MODEL_DB[modelKey];
  if (modelMatch) {
    return {
      status: modelMatch.ok && isExploitable(modelMatch.fw) ? 'JAILBREAKABLE' : 
             modelMatch.ok ? 'UNCERTAIN' : 'NOT_JAILBREAKABLE',
      firmware: modelMatch.fw,
      confidence: 'HIGH',
      description: isExploitable(modelMatch.fw)
        ? `Model ${modelKey} ships with firmware ${modelMatch.fw}, which is exploitable (≤ ${MAX_EXPLOITABLE_FIRMWARE}).`
        : `Model ${modelKey} ships with firmware ${modelMatch.fw}, which is above the current exploit ceiling (${MAX_EXPLOITABLE_FIRMWARE}).`,
      modelCode: parsed.modelCode,
      region: parsed.region,
      yearManufactured: parsed.yearManufactured || 0,
      monthManufactured: parsed.monthManufactured || 0,
    };
  }

  // Try firmware lookup table (for S01- barcode format)
  // modelVariant is the 3-char lookup key: [chassis][year][month]
  const lookupKey = parsed.modelVariant;
  const tableEntry = FIRMWARE_TABLE[lookupKey];

  if (tableEntry) {
    const lowestFw = tableEntry.fw[0];
    const highestFw = tableEntry.fw[tableEntry.fw.length - 1];
    const fwRange = tableEntry.fw.length > 1 ? tableEntry.fw.join(' / ') : lowestFw;

    // Determine status based on lowest firmware in range
    const lowestExploitable = isExploitable(lowestFw);
    const highestExploitable = isExploitable(highestFw);

    let status: FirmwareDetectionResult['status'];
    let confidence: Confidence;
    let description: string;

    if (lowestExploitable && highestExploitable) {
      // All firmware versions in range are exploitable
      status = 'JAILBREAKABLE';
      confidence = tableEntry.estimated ? 'MEDIUM' : 'HIGH';
      description = `${tableEntry.series}, firmware range: ${fwRange}. All versions are exploitable (≤ ${MAX_EXPLOITABLE_FIRMWARE}).`;
    } else if (lowestExploitable && !highestExploitable) {
      // Some are exploitable, some are not — UNCERTAIN
      status = 'UNCERTAIN';
      confidence = 'MEDIUM';
      description = `${tableEntry.series}, firmware range: ${fwRange}. Some units may be exploitable. The lowest observed firmware (${lowestFw}) is within the exploit range.`;
    } else {
      // None are exploitable
      status = 'NOT_JAILBREAKABLE';
      confidence = tableEntry.estimated ? 'MEDIUM' : 'HIGH';
      description = `${tableEntry.series}, firmware range: ${fwRange}. Above the current exploit ceiling (${MAX_EXPLOITABLE_FIRMWARE}).`;
    }

    return {
      status,
      firmware: fwRange,
      confidence,
      description,
      modelCode: tableEntry.series,
      region: parsed.region,
      yearManufactured: parsed.yearManufactured,
      monthManufactured: parsed.monthManufactured,
    };
  }

  // Fallback: if we have year/month but no table entry
  if (parsed.yearManufactured > 0) {
    return fallbackEstimate(parsed);
  }

  // Unknown
  return {
    status: 'UNCERTAIN',
    firmware: 'Unknown',
    confidence: 'LOW',
    description: 'This serial code is not in our database. Check the firmware version directly on the console.',
    modelCode: parsed.modelCode,
    region: parsed.region,
    yearManufactured: parsed.yearManufactured || 0,
    monthManufactured: parsed.monthManufactured || 0,
  };
}

/**
 * Fallback firmware estimate when no exact lookup match exists.
 * Uses broad year/chassis ranges from the document.
 */
function fallbackEstimate(parsed: SerialParseResult): FirmwareDetectionResult {
  const year = parsed.yearManufactured;
  const series = parsed.modelCode;

  let firmware = 'Unknown';
  let status: FirmwareDetectionResult['status'] = 'UNCERTAIN';
  let confidence: Confidence = 'LOW';
  let description = '';

  if (series.includes('10xx')) {
    // FAT 1st gen: FW 1.00 → 3.20
    firmware = '1.00 - 3.20';
    status = 'JAILBREAKABLE';
    confidence = 'HIGH';
    description = 'FAT 1st gen (CFI-10xx). These units shipped with FW 1.00-3.20, all exploitable.';
  } else if (series.includes('11xx') && year <= 2022) {
    // FAT 2nd gen: FW 3.00 → 6.02
    firmware = '3.00 - 6.02';
    status = 'UNCERTAIN';
    confidence = 'LOW';
    description = `FAT 2nd gen (CFI-11xx). FW range 3.00-6.02. Some versions may be exploitable. Check exact code.`;
  } else if (series.includes('12xx')) {
    // FAT 3rd gen: FW 5.10 → 7.60
    firmware = '5.10 - 7.60';
    status = 'UNCERTAIN';
    confidence = 'LOW';
    description = `FAT 3rd gen (CFI-12xx). FW range 5.10-7.60. Check exact firmware on console.`;
  } else if (series.includes('20xx')) {
    // Slim 1st gen: FW 7.00 → 12.00
    firmware = '7.00 - 12.00';
    status = 'UNCERTAIN';
    confidence = 'LOW';
    description = `Slim (CFI-20xx). FW range 7.00-12.00. Early units may be exploitable.`;
  } else if (series.includes('21xx')) {
    // Slim 2nd gen: FW 11.20 → 12.20
    firmware = '11.20 - 12.20';
    status = 'NOT_JAILBREAKABLE';
    confidence = 'HIGH';
    description = `Slim 2nd gen (CFI-21xx). FW range 11.20+, above current exploit ceiling.`;
  } else if (series.includes('70xx')) {
    // Pro 1st gen: FW 9.05 → 12.00
    firmware = '9.05 - 12.00';
    status = 'NOT_JAILBREAKABLE';
    confidence = 'HIGH';
    description = `Pro (CFI-70xx). FW range 9.05+, above current exploit ceiling.`;
  } else if (series.includes('71xx')) {
    // Pro 2nd gen: FW 11.20 → 12.20
    firmware = '11.20 - 12.20';
    status = 'NOT_JAILBREAKABLE';
    confidence = 'HIGH';
    description = `Pro 2nd gen (CFI-71xx). FW range 11.20+, above current exploit ceiling.`;
  } else {
    description = `Unknown model series. Manufactured ${year}. Check firmware directly on console.`;
  }

  return {
    status,
    firmware,
    confidence,
    description,
    modelCode: parsed.modelCode,
    region: parsed.region,
    yearManufactured: year,
    monthManufactured: parsed.monthManufactured || 0,
  };
}
