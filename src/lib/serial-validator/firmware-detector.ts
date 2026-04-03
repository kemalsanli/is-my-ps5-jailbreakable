/**
 * PS5 Firmware Detection Engine
 *
 * Uses manufacturing data from the serial number to estimate
 * the factory-installed firmware version.
 *
 * Based on PSDevWiki PS5 Serial Number Guide:
 * https://www.psdevwiki.com/ps5/Serial_Number_guide
 *
 * IMPORTANT DISCLAIMER:
 * This is an estimation based on community-gathered data.
 * The actual firmware may vary. Always verify before purchase.
 *
 * Data sources and credits:
 * - PSDevWiki community
 * - MODDED WARFARE (YouTube)
 * - Mc Kuc (YouTube)
 * - PS5 homebrew community
 */

import type {
  FirmwareDetectionResult,
  FirmwareRule,
  SerialParseResult,
  JailbreakStatus,
  Confidence,
} from '@/types/serial';

/**
 * Firmware rules ordered from most specific to most general.
 *
 * These rules are based on community-reported data from PSDevWiki.
 * Manufacturing date correlates with factory firmware:
 *
 * - 2020-2021: PS5 launch units, shipped with FW 1.00 - 3.xx
 * - Early 2022 (Jan-Mar): Likely FW 4.03 - 4.51
 * - Mid 2022 (Apr-Jun): Transition period, FW 4.50 - 5.50
 * - Late 2022 (Jul-Dec): FW 5.00 - 6.00
 * - 2023: FW 6.00 - 7.xx
 * - 2024+: FW 7.00+
 *
 * The current highest exploitable firmware is 7.61
 * (as of latest PSDevWiki data).
 */
const FIRMWARE_RULES: FirmwareRule[] = [
  // ─── 2020 Launch Units ─────────────────────────────────────────────
  {
    modelCode: '*',
    yearMin: 2020,
    yearMax: 2020,
    maxFirmware: '2.50',
    confidence: 'HIGH',
    status: 'JAILBREAKABLE',
  },

  // ─── 2021 All Months ──────────────────────────────────────────────
  {
    modelCode: '*',
    yearMin: 2021,
    yearMax: 2021,
    maxFirmware: '4.03',
    confidence: 'HIGH',
    status: 'JAILBREAKABLE',
  },

  // ─── 2022 Early (Jan-Mar) ─────────────────────────────────────────
  {
    modelCode: '*',
    yearMin: 2022,
    yearMax: 2022,
    monthMin: 1,
    monthMax: 3,
    maxFirmware: '4.51',
    confidence: 'HIGH',
    status: 'JAILBREAKABLE',
  },

  // ─── 2022 Mid (Apr-Jun) - Transition Period ───────────────────────
  {
    modelCode: '*',
    yearMin: 2022,
    yearMax: 2022,
    monthMin: 4,
    monthMax: 6,
    maxFirmware: '5.50',
    confidence: 'MEDIUM',
    status: 'JAILBREAKABLE',
  },

  // ─── 2022 Late (Jul-Sep) ──────────────────────────────────────────
  {
    modelCode: '*',
    yearMin: 2022,
    yearMax: 2022,
    monthMin: 7,
    monthMax: 9,
    maxFirmware: '6.00',
    confidence: 'MEDIUM',
    status: 'JAILBREAKABLE',
  },

  // ─── 2022 Very Late (Oct-Dec) ─────────────────────────────────────
  {
    modelCode: '*',
    yearMin: 2022,
    yearMax: 2022,
    monthMin: 10,
    monthMax: 12,
    maxFirmware: '6.50',
    confidence: 'LOW',
    status: 'UNCERTAIN',
  },

  // ─── 2023 Early (Jan-Mar) ─────────────────────────────────────────
  {
    modelCode: '*',
    yearMin: 2023,
    yearMax: 2023,
    monthMin: 1,
    monthMax: 3,
    maxFirmware: '6.50',
    confidence: 'LOW',
    status: 'UNCERTAIN',
  },

  // ─── 2023 Mid (Apr-Jun) ───────────────────────────────────────────
  {
    modelCode: '*',
    yearMin: 2023,
    yearMax: 2023,
    monthMin: 4,
    monthMax: 6,
    maxFirmware: '7.00',
    confidence: 'LOW',
    status: 'UNCERTAIN',
  },

  // ─── 2023 Late (Jul-Dec) ──────────────────────────────────────────
  {
    modelCode: '*',
    yearMin: 2023,
    yearMax: 2023,
    monthMin: 7,
    monthMax: 12,
    maxFirmware: '7.61',
    confidence: 'LOW',
    status: 'UNCERTAIN',
  },

  // ─── 2024 Early (Jan-Jun) ─────────────────────────────────────────
  {
    modelCode: '*',
    yearMin: 2024,
    yearMax: 2024,
    monthMin: 1,
    monthMax: 6,
    maxFirmware: '7.61',
    confidence: 'LOW',
    status: 'UNCERTAIN',
  },

  // ─── 2024 Late & Beyond ───────────────────────────────────────────
  {
    modelCode: '*',
    yearMin: 2024,
    yearMax: 2099,
    monthMin: 7,
    monthMax: 12,
    maxFirmware: '8.00+',
    confidence: 'HIGH',
    status: 'NOT_JAILBREAKABLE',
  },

  // ─── 2025+ ────────────────────────────────────────────────────────
  {
    modelCode: '*',
    yearMin: 2025,
    yearMax: 2099,
    maxFirmware: '8.00+',
    confidence: 'HIGH',
    status: 'NOT_JAILBREAKABLE',
  },
];

/**
 * The maximum exploitable firmware version
 * Update this when new exploits are released
 */
export const MAX_EXPLOITABLE_FIRMWARE = '7.61';

/**
 * Detect the likely firmware based on parsed serial number data.
 *
 * Algorithm:
 * 1. Iterate through rules from most specific to most general
 * 2. Match year range, optional month range, and optional model code
 * 3. Return the first matching rule's firmware estimation
 * 4. Fall back to UNCERTAIN if no rule matches
 */
export function detectFirmware(
  parsed: SerialParseResult
): FirmwareDetectionResult {
  const { yearManufactured, monthManufactured, modelCode, region } = parsed;

  for (const rule of FIRMWARE_RULES) {
    // Check year range
    if (yearManufactured < rule.yearMin || yearManufactured > rule.yearMax) {
      continue;
    }

    // Check month range if specified
    if (rule.monthMin !== undefined && rule.monthMax !== undefined) {
      if (
        monthManufactured < rule.monthMin ||
        monthManufactured > rule.monthMax
      ) {
        continue;
      }
    }

    // Check model code if not wildcard
    if (rule.modelCode !== '*' && !modelCode.includes(rule.modelCode)) {
      continue;
    }

    // Determine jailbreakability based on estimated firmware vs max exploitable
    const firmwareNum = parseFloat(rule.maxFirmware);
    const maxExploitable = parseFloat(MAX_EXPLOITABLE_FIRMWARE);
    let status: JailbreakStatus = rule.status;

    if (!isNaN(firmwareNum) && !isNaN(maxExploitable)) {
      if (firmwareNum <= maxExploitable && status !== 'UNCERTAIN') {
        status = 'JAILBREAKABLE';
      }
    }

    return {
      status,
      firmware: rule.maxFirmware,
      confidence: rule.confidence,
      description: buildDescription(status, rule.maxFirmware, rule.confidence),
      modelCode,
      yearManufactured,
      monthManufactured: monthManufactured,
      region,
    };
  }

  // Fallback: no rule matched
  return {
    status: 'UNCERTAIN',
    firmware: 'Unknown',
    confidence: 'LOW',
    description: 'Unable to determine firmware version from this serial number.',
    modelCode,
    yearManufactured,
    monthManufactured,
    region,
  };
}

/**
 * Build a human-readable description for the firmware detection result.
 */
function buildDescription(
  status: JailbreakStatus,
  firmware: string,
  confidence: Confidence
): string {
  switch (status) {
    case 'JAILBREAKABLE':
      if (confidence === 'HIGH') {
        return `This PS5 likely shipped with firmware ${firmware} or lower, which is exploitable. High confidence based on manufacturing date.`;
      }
      return `This PS5 may have shipped with firmware ${firmware} or lower. Moderate confidence — verify the actual firmware version.`;

    case 'NOT_JAILBREAKABLE':
      return `This PS5 likely shipped with firmware ${firmware}, which is currently not exploitable.`;

    case 'UNCERTAIN':
      return `This PS5 was manufactured in a transition period. Firmware could be around ${firmware}. Check the actual firmware version on the console.`;

    default:
      return 'Unable to determine firmware version.';
  }
}

/**
 * Get the list of all firmware rules (for debugging/display).
 */
export function getFirmwareRules(): FirmwareRule[] {
  return [...FIRMWARE_RULES];
}
