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

import type {
  SerialParseResult,
  FirmwareDetectionResult,
  Confidence,
  JailbreakExploitInfo,
  JBQuality,
} from '@/types/serial';

/**
 * Maximum exploitable firmware version (current known jailbreak ceiling).
 * FW 12.00 has NetControl UAF kernel exploit with kstuff+debug.
 * FW 12.02+ has NO kernel exploit yet.
 */
export const MAX_EXPLOITABLE_FIRMWARE = '12.00';

// ─── Month Names ─────────────────────────────────────────────────────
const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Model Type Names ────────────────────────────────────────────────
function getModelType(series: string): string {
  if (series.includes('10xx') || series.includes('11xx') || series.includes('12xx')) return 'FAT';
  if (series.includes('20xx')) return 'Slim';
  if (series.includes('21xx')) return 'Slim 2nd Gen';
  if (series.includes('70xx')) return 'Pro';
  if (series.includes('71xx')) return 'Pro 2nd Gen';
  return 'Unknown';
}

// ─── Jailbreak Info by Firmware Range ────────────────────────────────
/**
 * Returns detailed jailbreak exploit information for a given firmware version.
 * Based on the comprehensive jailbreak status table.
 */
function getJailbreakInfoForFirmware(fw: string): JailbreakExploitInfo {
  const fwNum = parseFirmwareToNumber(fw);

  // FW 1.00–1.14
  if (fwNum <= 1.14) {
    return {
      kernelExploit: 'UMTX',
      hasFullJB: true,
      exploits: ['UMTX Kernel', 'Debug Settings', 'Hypervisor'],
      quality: 'OK',
    };
  }
  // FW 2.00–2.70
  if (fwNum <= 2.70) {
    return {
      kernelExploit: 'UMTX',
      hasFullJB: true,
      exploits: ['UMTX Kernel', 'Debug Settings', 'Hypervisor'],
      quality: 'OK',
    };
  }
  // FW 3.00–3.20
  if (fwNum <= 3.20) {
    return {
      kernelExploit: 'IPV6 + UMTX',
      hasFullJB: true,
      exploits: ['IPV6 Kernel', 'UMTX Kernel', 'Debug Settings', 'kstuff', 'WebKit', 'BD-JB'],
      quality: 'BEST',
    };
  }
  // FW 3.21
  if (fwNum <= 3.21) {
    return {
      kernelExploit: 'IPV6 + UMTX',
      hasFullJB: true,
      exploits: ['IPV6 Kernel', 'UMTX Kernel', 'Debug Settings', 'kstuff', 'WebKit', 'BD-JB'],
      quality: 'BEST',
    };
  }
  // FW 4.00–4.51
  if (fwNum <= 4.51) {
    return {
      kernelExploit: 'IPV6 + UMTX',
      hasFullJB: true,
      exploits: ['IPV6 Kernel', 'UMTX Kernel', 'Debug Settings', 'kstuff', 'Y2JB', 'Netflix Hack', 'WebKit', 'BD-JB'],
      quality: 'BEST',
    };
  }
  // FW 5.00–5.50
  if (fwNum <= 5.50) {
    return {
      kernelExploit: 'UMTX',
      hasFullJB: true,
      exploits: ['UMTX Kernel', 'kstuff', 'WebKit', 'BD-JB'],
      quality: 'GOOD',
    };
  }
  // FW 6.00–7.61
  if (fwNum <= 7.61) {
    return {
      kernelExploit: 'UMTX',
      hasFullJB: true,
      exploits: ['UMTX Kernel', 'kstuff', 'BD-JB'],
      quality: 'OK',
    };
  }
  // FW 8.00–10.01
  if (fwNum <= 10.01) {
    return {
      kernelExploit: 'Lapse',
      hasFullJB: true,
      exploits: ['Lapse Kernel', 'kstuff', 'Debug Settings'],
      quality: 'OK',
    };
  }
  // FW 10.20–12.00
  if (fwNum <= 12.00) {
    return {
      kernelExploit: 'NetControl UAF',
      hasFullJB: true,
      exploits: ['NetControl UAF Kernel', 'kstuff', 'Debug Settings'],
      quality: 'OK',
    };
  }
  // FW 12.02–12.40
  if (fwNum <= 12.40) {
    return {
      kernelExploit: 'None (yet)',
      hasFullJB: false,
      exploits: ['mast1c0re (usermode)', 'Lua (usermode)'],
      quality: 'PARTIAL',
    };
  }
  // FW 12.60+
  return {
    kernelExploit: 'None',
    hasFullJB: false,
    exploits: [],
    quality: 'NONE',
  };
}

/**
 * Parse a firmware version string to a comparable number.
 * "10.01" → 10.01, "8.20.02" → 8.2002
 */
function parseFirmwareToNumber(fw: string): number {
  const parts = fw.split('.').map(Number);
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] + parts[1] / 100;
  // e.g. 8.20.02 → 8 + 20/100 + 2/10000
  return parts[0] + parts[1] / 100 + (parts[2] || 0) / 10000;
}

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
  // --- FAT — CFI-11xx (2021 production) ---
  '214': { fw: ['2.50', '3.00', '3.10'], series: 'CFI-11xx', estimated: true },
  '215': { fw: ['3.00', '3.10'], series: 'CFI-11xx' },
  '216': { fw: ['3.00', '3.20'], series: 'CFI-11xx' },
  '217': { fw: ['3.20', '3.21'], series: 'CFI-11xx' },
  '218': { fw: ['3.21'], series: 'CFI-11xx' },
  '219': { fw: ['3.20', '4.00'], series: 'CFI-11xx' },
  '21A': { fw: ['3.20', '4.03'], series: 'CFI-11xx' },
  '21B': { fw: ['4.03', '4.50'], series: 'CFI-11xx' },
  '21C': { fw: ['4.50'], series: 'CFI-11xx' },

  // --- FAT — CFI-11xx (2022 production) ---
  '221': { fw: ['4.50'], series: 'CFI-11xx' },
  '222': { fw: ['4.50'], series: 'CFI-11xx' },
  '223': { fw: ['4.50', '5.00'], series: 'CFI-11xx' },
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
  '33B': { fw: ['8.20'], series: 'CFI-12xx', estimated: true },
  '33C': { fw: ['8.40'], series: 'CFI-12xx', estimated: true },

  // --- Slim — CFI-20xx (2023 production) ---
  '434': { fw: ['7.00'], series: 'CFI-20xx' },
  '435': { fw: ['7.00', '7.20'], series: 'CFI-20xx' },
  '436': { fw: ['7.20', '7.40'], series: 'CFI-20xx' },
  '437': { fw: ['7.40', '7.60'], series: 'CFI-20xx' },
  '438': { fw: ['7.60', '7.61'], series: 'CFI-20xx' },
  '439': { fw: ['7.61', '8.00'], series: 'CFI-20xx' },
  '43A': { fw: ['7.61', '8.20'], series: 'CFI-20xx' },
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
  '449': { fw: ['9.60', '10.01'], series: 'CFI-20xx' },
  '44A': { fw: ['9.60', '10.20'], series: 'CFI-20xx' },
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
  '145': { fw: ['9.05'], series: 'CFI-70xx' },
  '146': { fw: ['9.05', '9.40'], series: 'CFI-70xx' },
  '147': { fw: ['9.40', '9.60'], series: 'CFI-70xx' },
  '148': { fw: ['9.60'], series: 'CFI-70xx' },
  '149': { fw: ['9.60', '10.01'], series: 'CFI-70xx' },
  '14A': { fw: ['9.60', '10.20'], series: 'CFI-70xx' },
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
const MODEL_DB: Record<string, { fw: string; series: string }> = {
  // Original PS5 Disc Edition (CFI-1000 series) — FAT 1st gen
  'CFI-1000A': { fw: '1.00', series: 'CFI-10xx' },
  'CFI-1000B': { fw: '1.00', series: 'CFI-10xx' },
  'CFI-1000J': { fw: '1.00', series: 'CFI-10xx' },
  'CFI-1001A': { fw: '1.50', series: 'CFI-10xx' },
  'CFI-1010A': { fw: '2.00', series: 'CFI-10xx' },
  'CFI-1015A': { fw: '4.03', series: 'CFI-10xx' },
  'CFI-1015B': { fw: '4.03', series: 'CFI-10xx' },
  'CFI-1015C': { fw: '4.03', series: 'CFI-10xx' },
  'CFI-1015J': { fw: '4.03', series: 'CFI-10xx' },
  'CFI-1016A': { fw: '4.03', series: 'CFI-10xx' },
  'CFI-1016B': { fw: '4.03', series: 'CFI-10xx' },
  'CFI-1016C': { fw: '4.03', series: 'CFI-10xx' },
  'CFI-1016J': { fw: '4.03', series: 'CFI-10xx' },
  'CFI-1017A': { fw: '4.51', series: 'CFI-10xx' },
  'CFI-1017B': { fw: '4.51', series: 'CFI-10xx' },
  'CFI-1017C': { fw: '4.51', series: 'CFI-10xx' },
  'CFI-1018A': { fw: '4.51', series: 'CFI-10xx' },
  'CFI-1018B': { fw: '4.51', series: 'CFI-10xx' },
  'CFI-1018C': { fw: '4.51', series: 'CFI-10xx' },

  // CFI-10xx with higher firmware
  'CFI-1019A': { fw: '5.10', series: 'CFI-10xx' },
  'CFI-1019B': { fw: '5.10', series: 'CFI-10xx' },
  'CFI-1020A': { fw: '5.10', series: 'CFI-10xx' },
  'CFI-1020B': { fw: '5.10', series: 'CFI-10xx' },
  'CFI-1021A': { fw: '6.20', series: 'CFI-10xx' },
  'CFI-1021B': { fw: '6.20', series: 'CFI-10xx' },
  'CFI-1021C': { fw: '6.20', series: 'CFI-10xx' },
  'CFI-1021J': { fw: '6.20', series: 'CFI-10xx' },
  'CFI-1022A': { fw: '6.20', series: 'CFI-10xx' },
  'CFI-1022B': { fw: '6.20', series: 'CFI-10xx' },
  'CFI-1022C': { fw: '6.20', series: 'CFI-10xx' },
  'CFI-1023A': { fw: '7.00', series: 'CFI-10xx' },

  // FAT 3rd gen — CFI-12xx
  'CFI-1200A': { fw: '5.10', series: 'CFI-12xx' },
  'CFI-1200B': { fw: '5.10', series: 'CFI-12xx' },
  'CFI-1215A': { fw: '6.50', series: 'CFI-12xx' },
  'CFI-1215B': { fw: '6.50', series: 'CFI-12xx' },
  'CFI-1216A': { fw: '7.00', series: 'CFI-12xx' },
  'CFI-1216B': { fw: '7.00', series: 'CFI-12xx' },

  // Slim — CFI-20xx
  'CFI-2000A': { fw: '7.00', series: 'CFI-20xx' },
  'CFI-2000B': { fw: '7.00', series: 'CFI-20xx' },
  'CFI-2008A': { fw: '10.00', series: 'CFI-20xx' },
  'CFI-2008B': { fw: '10.00', series: 'CFI-20xx' },
  'CFI-2010A': { fw: '11.00', series: 'CFI-20xx' },
  'CFI-2010B': { fw: '11.00', series: 'CFI-20xx' },

  // Pro — CFI-70xx
  'CFI-7000A': { fw: '9.05', series: 'CFI-70xx' },
  'CFI-7000B': { fw: '9.05', series: 'CFI-70xx' },
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
 * Get the best jailbreak info for a firmware range.
 * Uses the lowest firmware in the range to determine exploits.
 */
function getJailbreakInfoForRange(fwList: string[]): JailbreakExploitInfo {
  // Use the lowest firmware for the best-case scenario
  const lowestFw = fwList[0];
  return getJailbreakInfoForFirmware(lowestFw);
}

/**
 * Determine the jailbreak status from firmware range.
 *
 * Decision logic:
 * 1. ALL values < 12.02 → ✅ JAILBREAKABLE
 * 2. Range crosses 12.02 (e.g. 11.60/12.02) → ⚠️ UNCERTAIN
 * 3. Lowest value ≥ 12.02 → ❌ NOT_JAILBREAKABLE
 */
function determineStatus(fwList: string[]): {
  status: FirmwareDetectionResult['status'];
  jbInfo: JailbreakExploitInfo;
} {
  const lowestFw = fwList[0];
  const highestFw = fwList[fwList.length - 1];

  const lowestExploitable = isExploitable(lowestFw);
  const highestExploitable = isExploitable(highestFw);

  if (lowestExploitable && highestExploitable) {
    return {
      status: 'JAILBREAKABLE',
      jbInfo: getJailbreakInfoForRange(fwList),
    };
  } else if (lowestExploitable && !highestExploitable) {
    return {
      status: 'UNCERTAIN',
      jbInfo: getJailbreakInfoForRange(fwList),
    };
  } else {
    return {
      status: 'NOT_JAILBREAKABLE',
      jbInfo: getJailbreakInfoForFirmware(highestFw),
    };
  }
}

/**
 * Build detailed result with all new fields.
 */
function buildDetailedResult(
  parsed: SerialParseResult,
  series: string,
  fwRange: string,
  status: FirmwareDetectionResult['status'],
  confidence: Confidence,
  description: string,
  jbInfo: JailbreakExploitInfo,
  estimated: boolean = false,
): FirmwareDetectionResult {
  const modelType = getModelType(series);
  const monthName = parsed.monthManufactured > 0 && parsed.monthManufactured <= 12
    ? MONTH_NAMES[parsed.monthManufactured]
    : '';
  const yearStr = parsed.yearManufactured > 0 ? String(parsed.yearManufactured) : '';
  const production = monthName && yearStr ? `${monthName} ${yearStr}` : yearStr || 'Unknown';

  let warning = '';
  if (status === 'JAILBREAKABLE' || status === 'UNCERTAIN') {
    warning = 'This is FACTORY firmware only. The console may have been updated. Do NOT connect to PSN before verifying firmware.';
  }
  if (estimated) {
    warning += warning ? ' ' : '';
    warning += 'Firmware range includes estimated values (~).';
  }

  return {
    status,
    firmware: fwRange,
    confidence,
    description,
    modelCode: series,
    region: parsed.region,
    yearManufactured: parsed.yearManufactured,
    monthManufactured: parsed.monthManufactured,
    modelName: series,
    modelType,
    factoryCountry: parsed.factory,
    productionMonthName: production,
    firmwareRange: fwRange,
    jailbreakInfo: jbInfo,
    warning,
  };
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
    const fw = modelMatch.fw;
    const exploitable = isExploitable(fw);
    const jbInfo = getJailbreakInfoForFirmware(fw);

    const status: FirmwareDetectionResult['status'] = exploitable
      ? 'JAILBREAKABLE'
      : 'NOT_JAILBREAKABLE';

    const description = exploitable
      ? `Model ${modelKey} ships with firmware ${fw}. Full jailbreak available.`
      : `Model ${modelKey} ships with firmware ${fw}, above the current exploit ceiling (${MAX_EXPLOITABLE_FIRMWARE}).`;

    return buildDetailedResult(
      parsed,
      modelMatch.series,
      fw,
      status,
      'HIGH',
      description,
      jbInfo,
    );
  }

  // Try firmware lookup table (for S01- barcode format)
  const lookupKey = parsed.modelVariant;
  const tableEntry = FIRMWARE_TABLE[lookupKey];

  if (tableEntry) {
    const fwRange = tableEntry.fw.length > 1 ? tableEntry.fw.join(' / ') : tableEntry.fw[0];
    const { status, jbInfo } = determineStatus(tableEntry.fw);
    const confidence: Confidence = tableEntry.estimated ? 'MEDIUM' : (status === 'UNCERTAIN' ? 'MEDIUM' : 'HIGH');

    let description = '';
    if (status === 'JAILBREAKABLE') {
      description = `${tableEntry.series} (${getModelType(tableEntry.series)}), firmware range: ${fwRange}. All versions are exploitable (≤ ${MAX_EXPLOITABLE_FIRMWARE}).`;
    } else if (status === 'UNCERTAIN') {
      description = `${tableEntry.series} (${getModelType(tableEntry.series)}), firmware range: ${fwRange}. Some units may be exploitable — depends on actual firmware.`;
    } else {
      description = `${tableEntry.series} (${getModelType(tableEntry.series)}), firmware range: ${fwRange}. Above the current exploit ceiling (${MAX_EXPLOITABLE_FIRMWARE}).`;
    }

    return buildDetailedResult(
      parsed,
      tableEntry.series,
      fwRange,
      status,
      confidence,
      description,
      jbInfo,
      tableEntry.estimated,
    );
  }

  // Fallback: if we have year/month but no table entry
  if (parsed.yearManufactured > 0) {
    return fallbackEstimate(parsed);
  }

  // Unknown
  const unknownJbInfo: JailbreakExploitInfo = {
    kernelExploit: 'Unknown',
    hasFullJB: false,
    exploits: [],
    quality: 'NONE',
  };

  return buildDetailedResult(
    parsed,
    parsed.modelCode,
    'Unknown',
    'UNCERTAIN',
    'LOW',
    'This serial code is not in our database. Check the firmware version directly on the console.',
    unknownJbInfo,
  );
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
  let jbInfo: JailbreakExploitInfo;

  if (series.includes('10xx')) {
    firmware = '1.00 - 3.20';
    status = 'JAILBREAKABLE';
    confidence = 'HIGH';
    description = 'FAT 1st gen (CFI-10xx). These units shipped with FW 1.00-3.20, all exploitable.';
    jbInfo = getJailbreakInfoForFirmware('3.20');
  } else if (series.includes('11xx') && year <= 2022) {
    firmware = '3.00 - 6.02';
    status = 'JAILBREAKABLE';
    confidence = 'MEDIUM';
    description = `FAT 2nd gen (CFI-11xx). FW range 3.00-6.02. All versions are exploitable if not updated.`;
    jbInfo = getJailbreakInfoForFirmware('3.00');
  } else if (series.includes('12xx')) {
    firmware = '5.10 - 8.40';
    status = 'JAILBREAKABLE';
    confidence = 'MEDIUM';
    description = `FAT 3rd gen (CFI-12xx). FW range 5.10-8.40. All factory firmware versions are exploitable.`;
    jbInfo = getJailbreakInfoForFirmware('5.10');
  } else if (series.includes('20xx')) {
    firmware = '7.00 - 12.00';
    status = 'UNCERTAIN';
    confidence = 'LOW';
    description = `Slim (CFI-20xx). FW range 7.00-12.00. Early units are exploitable, later ones may not be.`;
    jbInfo = getJailbreakInfoForFirmware('7.00');
  } else if (series.includes('21xx')) {
    firmware = '11.20 - 12.20';
    status = 'UNCERTAIN';
    confidence = 'LOW';
    description = `Slim 2nd gen (CFI-21xx). FW range 11.20-12.20. Some units may be exploitable (≤ 12.00).`;
    jbInfo = getJailbreakInfoForFirmware('11.20');
  } else if (series.includes('70xx')) {
    firmware = '9.05 - 12.00';
    status = 'UNCERTAIN';
    confidence = 'LOW';
    description = `Pro (CFI-70xx). FW range 9.05-12.00. Early units are exploitable, later ones may not be.`;
    jbInfo = getJailbreakInfoForFirmware('9.05');
  } else if (series.includes('71xx')) {
    firmware = '11.20 - 12.20';
    status = 'UNCERTAIN';
    confidence = 'LOW';
    description = `Pro 2nd gen (CFI-71xx). FW range 11.20-12.20. Some units may be exploitable (≤ 12.00).`;
    jbInfo = getJailbreakInfoForFirmware('11.20');
  } else {
    description = `Unknown model series. Manufactured ${year}. Check firmware directly on console.`;
    jbInfo = {
      kernelExploit: 'Unknown',
      hasFullJB: false,
      exploits: [],
      quality: 'NONE',
    };
  }

  return buildDetailedResult(
    parsed,
    series,
    firmware,
    status,
    confidence,
    description,
    jbInfo,
  );
}
