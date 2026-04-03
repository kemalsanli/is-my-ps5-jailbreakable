/**
 * PS5 Firmware Detector
 *
 * Estimates firmware version based on PS5 serial number components.
 * Based on PSDevWiki data and community research.
 */

import type { SerialParseResult, FirmwareDetectionResult, Confidence } from '@/types/serial';

/**
 * Maximum exploitable firmware version
 */
export const MAX_EXPLOITABLE_FIRMWARE = '4.51';

/**
 * Short model code lookup database (from reference HTML)
 * Maps short format like "CFI-1215A" to firmware info
 */
const MODEL_DB: Record<string, { fw: string; ok: boolean }> = {
  // Original PS5 Disc Edition (CFI-1000 series)
  'CFI-1000A': { fw: '1.00', ok: true },
  'CFI-1001A': { fw: '1.50', ok: true },
  'CFI-1010A': { fw: '2.00', ok: true },
  'CFI-1015A': { fw: '4.03', ok: true },
  'CFI-1016A': { fw: '4.03', ok: true },
  'CFI-1017A': { fw: '4.51', ok: true },
  'CFI-1018A': { fw: '4.51', ok: true },
  'CFI-1019A': { fw: '5.10', ok: true },
  'CFI-1020A': { fw: '5.10', ok: true },
  'CFI-1021A': { fw: '6.20', ok: false },
  'CFI-1022A': { fw: '6.20', ok: false },
  'CFI-1023A': { fw: '7.00', ok: false },
  // Digital Edition
  'CFI-1000B': { fw: '1.00', ok: true },
  'CFI-1015B': { fw: '4.03', ok: true },
  'CFI-1016B': { fw: '4.03', ok: true },
  'CFI-1017B': { fw: '4.51', ok: true },
  'CFI-1018B': { fw: '4.51', ok: true },
  'CFI-1019B': { fw: '5.10', ok: true },
  'CFI-1020B': { fw: '5.10', ok: true },
  'CFI-1021B': { fw: '6.20', ok: false },
  'CFI-1022B': { fw: '6.20', ok: false },
  // UK/Europe variants
  'CFI-1015C': { fw: '4.03', ok: true },
  'CFI-1016C': { fw: '4.03', ok: true },
  'CFI-1017C': { fw: '4.51', ok: true },
  'CFI-1018C': { fw: '4.51', ok: true },
  'CFI-1021C': { fw: '6.20', ok: false },
  'CFI-1022C': { fw: '6.20', ok: false },
  // Japan
  'CFI-1000J': { fw: '1.00', ok: true },
  'CFI-1015J': { fw: '4.03', ok: true },
  'CFI-1016J': { fw: '4.03', ok: true },
  'CFI-1021J': { fw: '6.20', ok: false },
  // PS5 Slim / Revision (CFI-2000 series) - NOT jailbreakable
  'CFI-2000A': { fw: '9.00', ok: false },
  'CFI-2008A': { fw: '10.00', ok: false },
  'CFI-2010A': { fw: '11.00', ok: false },
  'CFI-2000B': { fw: '9.00', ok: false },
  'CFI-2008B': { fw: '10.00', ok: false },
  'CFI-2010B': { fw: '11.00', ok: false },
};

/**
 * Detect firmware and jailbreak status from a parsed serial number.
 */
export function detectFirmware(
  parsed: SerialParseResult
): FirmwareDetectionResult {
  // First, try the short model DB lookup
  const dbKey = parsed.modelCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Try direct match: "CFI1215A"
  const directMatch = MODEL_DB[dbKey];
  if (directMatch) {
    return {
      status: directMatch.ok ? 'JAILBREAKABLE' : 'NOT_JAILBREAKABLE',
      firmware: directMatch.fw,
      confidence: 'HIGH',
      description: directMatch.ok
        ? `This model ships with firmware ${directMatch.fw} which is exploitable.`
        : `This model ships with firmware ${directMatch.fw} which is NOT exploitable.`,
      modelCode: parsed.modelCode,
      region: parsed.region,
      yearManufactured: parsed.yearManufactured || 0,
      monthManufactured: parsed.monthManufactured || 0,
    };
  }

  // Try partial match: model variant + region
  const partialKey = `CFI${parsed.modelVariant}${parsed.region}`;
  const partialMatch = MODEL_DB[partialKey.toUpperCase()];
  if (partialMatch) {
    return {
      status: partialMatch.ok ? 'JAILBREAKABLE' : 'NOT_JAILBREAKABLE',
      firmware: partialMatch.fw,
      confidence: 'HIGH',
      description: partialMatch.ok
        ? `This model variant ships with firmware ${partialMatch.fw} which is exploitable.`
        : `This model variant ships with firmware ${partialMatch.fw} which is NOT exploitable.`,
      modelCode: parsed.modelCode,
      region: parsed.region,
      yearManufactured: parsed.yearManufactured || 0,
      monthManufactured: parsed.monthManufactured || 0,
    };
  }

  // Fall back to year-based estimation for full serial numbers
  if (parsed.yearManufactured > 0) {
    return estimateFromManufacturingDate(parsed);
  }

  // Unknown model - uncertain
  return {
    status: 'UNCERTAIN',
    firmware: 'Unknown',
    confidence: 'LOW',
    description: 'This model code is not in our database. Check the firmware version directly on the console.',
    modelCode: parsed.modelCode,
    region: parsed.region,
    yearManufactured: parsed.yearManufactured || 0,
    monthManufactured: parsed.monthManufactured || 0,
  };
}

/**
 * Estimate firmware from manufacturing date (year/month).
 */
function estimateFromManufacturingDate(
  parsed: SerialParseResult
): FirmwareDetectionResult {
  const year = parsed.yearManufactured;
  const month = parsed.monthManufactured;

  let firmware = 'Unknown';
  let status: FirmwareDetectionResult['status'] = 'UNCERTAIN';
  let confidence: Confidence = 'LOW';
  let description = '';

  if (year === 2020) {
    firmware = '2.50';
    status = 'JAILBREAKABLE';
    confidence = 'HIGH';
    description = 'Manufactured in 2020. Ships with firmware ≤ 2.50, which is exploitable.';
  } else if (year === 2021) {
    firmware = '4.03';
    status = 'JAILBREAKABLE';
    confidence = 'HIGH';
    description = 'Manufactured in 2021. Ships with firmware ≤ 4.51, which is exploitable.';
  } else if (year === 2022 && month >= 1 && month <= 3) {
    firmware = '4.51';
    status = 'JAILBREAKABLE';
    confidence = 'HIGH';
    description = 'Manufactured Q1 2022. Likely ships with firmware ≤ 4.51, which is exploitable.';
  } else if (year === 2022 && month >= 4 && month <= 6) {
    firmware = '5.10';
    status = 'JAILBREAKABLE';
    confidence = 'MEDIUM';
    description = 'Manufactured Q2 2022. May ship with firmware around 5.10. Check actual firmware on console.';
  } else if (year === 2022 && month >= 7 && month <= 9) {
    firmware = '5.50';
    status = 'JAILBREAKABLE';
    confidence = 'MEDIUM';
    description = 'Manufactured Q3 2022. May ship with firmware around 5.50. Check actual firmware on console.';
  } else if (year === 2022) {
    firmware = '6.00';
    status = 'UNCERTAIN';
    confidence = 'LOW';
    description = 'Manufactured late 2022. Firmware is uncertain — check the actual version on the console.';
  } else if (year === 2023 && month >= 1 && month <= 6) {
    firmware = '6.50';
    status = 'UNCERTAIN';
    confidence = 'LOW';
    description = 'Manufactured early 2023. Likely ships with firmware ≥ 6.20, which is NOT exploitable.';
  } else if (year >= 2023) {
    firmware = '7.00+';
    status = 'NOT_JAILBREAKABLE';
    confidence = 'HIGH';
    description = 'Manufactured 2023 or later. Ships with firmware too new for current exploits.';
  } else {
    firmware = 'Unknown';
    status = 'UNCERTAIN';
    confidence = 'LOW';
    description = 'Could not determine firmware from serial number.';
  }

  return {
    status,
    firmware,
    confidence,
    description,
    modelCode: parsed.modelCode,
    region: parsed.region,
    yearManufactured: year,
    monthManufactured: month,
  };
}
