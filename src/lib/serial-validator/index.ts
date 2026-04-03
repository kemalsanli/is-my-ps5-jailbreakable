/**
 * PS5 Serial Number Validator
 *
 * Main API for checking PS5 serial numbers.
 * Combines format parsing, region detection, and firmware estimation.
 */

import { parseSerial, normalizeSerial, isValidFormat } from './formats';
import { detectFirmware, MAX_EXPLOITABLE_FIRMWARE } from './firmware-detector';
import type { FirmwareDetectionResult } from '@/types/serial';

export { normalizeSerial, parseSerial, isValidFormat, formatSerialInput } from './formats';
export { detectFirmware, MAX_EXPLOITABLE_FIRMWARE } from './firmware-detector';

/**
 * Quick check if a serial string has a valid format.
 */
export function isSerialValid(raw: string): boolean {
  return isValidFormat(raw);
}

/**
 * Get the maximum firmware version that can be exploited.
 */
export function getMaxExploitableFirmware(): string {
  return MAX_EXPLOITABLE_FIRMWARE;
}

/**
 * Check a PS5 serial number and return firmware/jailbreak status.
 *
 * This is the main function users should call. It:
 * 1. Normalizes the input
 * 2. Parses the serial number format
 * 3. Detects the firmware version
 *
 * @param rawSerial - The user-provided serial number string
 * @returns FirmwareDetectionResult or null if format is invalid
 */
export function checkSerial(rawSerial: string): FirmwareDetectionResult | null {
  const parsed = parseSerial(rawSerial);
  if (!parsed || !parsed.isValid) {
    return null;
  }

  return detectFirmware(parsed);
}
