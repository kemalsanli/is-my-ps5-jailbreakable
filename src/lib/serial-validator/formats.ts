/**
 * PS5 Serial Number Format Definitions and Parser
 *
 * Based on PSDevWiki PS5 Serial Number Guide
 * https://www.psdevwiki.com/ps5/Serial_Number_guide
 *
 * PS5 serial numbers follow this general format:
 *
 * CFI-MMMMR YYWF SSSS
 *
 * Where:
 * - CFI     = Fixed prefix for all PS5 models
 * - MMMM    = Model number (1000, 1015, 1100, 1200, 2000, etc.)
 * - R       = Region code (A=US, B=UK, J=JP, etc.)
 * - YY      = Manufacturing year (last 2 digits, e.g. 21=2021)
 * - W       = Manufacturing week/month indicator
 * - F       = Factory identifier
 * - SSSS    = Unit serial (sequential)
 *
 * Alternative bar-code based format commonly found on packaging:
 *
 * S01-G2XYYF SSSS (17 characters)
 *
 * The barcode / sticker serial is what users usually enter.
 */

import type { SerialParseResult } from '@/types/serial';

/**
 * Known serial number format patterns.
 * Each pattern maps a regex to the extraction logic.
 */

/**
 * Barcode-style format: e.g. "S01-G2121W9D1234" or similar
 * Pattern breakdown:
 *   S01-G2   = Fixed prefix (PS5 barcode identifier)
 *   X        = Model variant character
 *   YY       = Year code (21, 22, 23, 24, 25 ...)
 *   W        = Month/Week indicator (1-9, A-C for months)
 *   F        = Factory code
 *   DDDD     = Sequence digits
 */
const BARCODE_PATTERN =
  /^S01-G2([A-Z0-9])(\d{2})([1-9A-C])(\w)(\d+[A-Z]?)(\d{4,})$/i;

/**
 * CFI-based format: e.g. "CFI-1015A 21W9D 1234"
 * Users might input with or without spaces/dashes
 */
const CFI_PATTERN =
  /^CFI-?(\d{4})([A-Z])\s*(\d{2})(\w)(\w)[\s-]?(\d{4,})$/i;

/**
 * Loose pattern: just the critical parts with any separator
 */
const LOOSE_PATTERN =
  /^[A-Z0-9]{3,4}[-\s]?[A-Z0-9]{2}([A-Z0-9])(\d{2})([1-9A-C])(\w)(\d?\w?)(\d{4,})$/i;

/**
 * Normalize user input: uppercase, trim, remove extra spaces
 */
export function normalizeSerial(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Parse a PS5 serial number and extract its components.
 *
 * Tries multiple known formats (barcode, CFI, loose).
 * Returns null if none match.
 */
export function parseSerial(raw: string): SerialParseResult | null {
  const normalized = normalizeSerial(raw);

  // Try barcode format first (most common user input)
  const barcodeMatch = normalized.match(BARCODE_PATTERN);
  if (barcodeMatch) {
    const [, modelVariant, yearStr, monthChar, factory, , sequence] =
      barcodeMatch;
    const year = 2000 + parseInt(yearStr, 10);
    const month = parseMonthChar(monthChar);

    return {
      isValid: true,
      modelCode: `barcode-${modelVariant}`,
      modelVariant: modelVariant,
      yearManufactured: year,
      monthManufactured: month,
      weekManufactured: parseInt(sequence.slice(0, 2), 10) || 0,
      region: modelVariant,
      factory: factory,
      raw: normalized,
    };
  }

  // Try CFI format
  const cfiMatch = normalized.match(CFI_PATTERN);
  if (cfiMatch) {
    const [, modelNum, region, yearStr, monthChar, factory, sequence] =
      cfiMatch;
    const year = 2000 + parseInt(yearStr, 10);
    const month = parseMonthChar(monthChar);

    return {
      isValid: true,
      modelCode: `CFI-${modelNum}`,
      modelVariant: modelNum,
      yearManufactured: year,
      monthManufactured: month,
      weekManufactured: parseInt(sequence.slice(0, 2), 10) || 0,
      region: region,
      factory: factory,
      raw: normalized,
    };
  }

  // Try loose format
  const looseMatch = normalized.match(LOOSE_PATTERN);
  if (looseMatch) {
    const [, modelVariant, yearStr, monthChar, factory, , sequence] =
      looseMatch;
    const year = 2000 + parseInt(yearStr, 10);
    const month = parseMonthChar(monthChar);

    return {
      isValid: true,
      modelCode: `unknown-${modelVariant}`,
      modelVariant: modelVariant,
      yearManufactured: year,
      monthManufactured: month,
      weekManufactured: parseInt(sequence?.slice(0, 2) || '0', 10),
      region: modelVariant,
      factory: factory,
      raw: normalized,
    };
  }

  return null;
}

/**
 * Convert month character to number.
 * 1-9 = January-September, A=October, B=November, C=December
 */
export function parseMonthChar(char: string): number {
  const upper = char.toUpperCase();
  if (upper >= '1' && upper <= '9') {
    return parseInt(upper, 10);
  }
  switch (upper) {
    case 'A':
      return 10;
    case 'B':
      return 11;
    case 'C':
      return 12;
    default:
      return 0;
  }
}

/**
 * Validate that a raw serial string has a recognizable format.
 * This is a quick check before full parsing.
 */
export function isValidFormat(raw: string): boolean {
  const normalized = normalizeSerial(raw);
  return (
    BARCODE_PATTERN.test(normalized) ||
    CFI_PATTERN.test(normalized) ||
    LOOSE_PATTERN.test(normalized)
  );
}

/**
 * Get a human-readable format hint for the expected serial number.
 */
export function getFormatHint(): string {
  return 'S01-G2X01W9DXXXX (barcode label) or CFI-XXXXR YYWD SSSS';
}
