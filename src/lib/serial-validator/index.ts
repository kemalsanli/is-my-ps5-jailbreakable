/**
 * PS5 Serial Number Validator
 *
 * Main entry point for the serial number validation library.
 * Combines format parsing, region detection, and firmware estimation.
 *
 * Data based on PSDevWiki PS5 Serial Number Guide:
 * https://www.psdevwiki.com/ps5/Serial_Number_guide
 *
 * Credits:
 * - PSDevWiki community for serial number research
 * - MODDED WARFARE for PS5 jailbreak information
 * - Mc Kuc for technical documentation
 * - The PS5 homebrew community
 */

import type { FirmwareDetectionResult } from '@/types/serial';
import { parseSerial, isValidFormat, normalizeSerial } from './formats';
import { detectFirmware, MAX_EXPLOITABLE_FIRMWARE } from './firmware-detector';
import { getRegionInfo } from './regions';

export {
  parseSerial,
  isValidFormat,
  normalizeSerial,
  detectFirmware,
  getRegionInfo,
  MAX_EXPLOITABLE_FIRMWARE,
};

/**
 * Perform a complete serial number check.
 *
 * This is the main function used by the UI.
 * It validates format, parses components, and detects firmware.
 *
 * @param rawSerial - The raw serial number string from user input
 * @returns Firmware detection result, or null if format is invalid
 */
export function checkSerial(
  rawSerial: string
): FirmwareDetectionResult | null {
  const normalized = normalizeSerial(rawSerial);

  if (!normalized || normalized.length < 10) {
    return null;
  }

  const parsed = parseSerial(normalized);

  if (!parsed || !parsed.isValid) {
    return null;
  }

  const result = detectFirmware(parsed);

  // Enrich with region info
  const regionInfo = getRegionInfo(parsed.region);
  if (regionInfo) {
    result.region = regionInfo.name;
  }

  return result;
}

/**
 * Quick validation check - returns true if the serial looks valid.
 */
export function isSerialValid(rawSerial: string): boolean {
  return isValidFormat(rawSerial);
}

/**
 * Get the current maximum exploitable firmware version.
 */
export function getMaxExploitableFirmware(): string {
  return MAX_EXPLOITABLE_FIRMWARE;
}
