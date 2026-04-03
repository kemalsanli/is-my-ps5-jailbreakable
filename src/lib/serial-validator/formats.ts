/**
 * PS5 Serial Number Format Definitions and Parser
 *
 * Based on PSDevWiki PS5 Serial Number Guide
 * https://www.psdevwiki.com/ps5/Serial_Number_guide
 * Serial format decoded by: MCKUC (YouTube)
 * Firmware data organized by: qtr_703 (Twitter/Discord)
 *
 * PS5 serial numbers on box stickers begin with S01- prefix:
 *
 * S01-[F][C][Y][M]xxxxxxxxxxxx
 *
 * Where (positions are 1-indexed after S01-):
 * - Position 5 (F): Factory/Region code (E/F/G = China, M = Malaysia, K = Japan)
 * - Position 6 (C): Chassis class digit (1=CFI-10xx, 2=CFI-11xx, 3=CFI-12xx, 4=CFI-20xx, 5=CFI-21xx)
 *                    Pro models: 1=CFI-70xx, 2=CFI-71xx (distinguished by year 2024+)
 * - Position 7 (Y): Production year (1=2021, 2=2022, 3=2023, 4=2024, 5=2025, 6=2026)
 * - Position 8 (M): Production month (1-9=Jan-Sep, A=Oct, B=Nov, C=Dec)
 * - Position 9+: Unit-specific serial digits (not decoded)
 *
 * Short format (model code only): CFI-XXXXR (e.g., CFI-1215A)
 * where R is region: A=US, B=UK/Digital, J=JP, etc.
 */

import type { SerialParseResult } from '@/types/serial';

// --- Patterns ---

/**
 * Short model code format: e.g. "CFI-1215A" or "CF1-1215A"
 */
const SHORT_MODEL_PATTERN = /^(CFI?)-?(\d{4})([A-Z])$/i;

/**
 * S01 barcode serial format:
 * S01-[F][C][Y][M][rest...]
 * After S01-, we capture position 5 onwards.
 * Minimum 10 characters total.
 */
const S01_PATTERN = /^S01-?([A-Z])(\d)(\d)([1-9A-C])(.+)$/i;

// --- Functions ---

/**
 * Normalize user input: uppercase, trim, remove spaces
 */
export function normalizeSerial(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Format serial number for display as user types or pastes.
 */
export function formatSerialInput(input: string): string {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9-]/g, '').replace(/--+/g, '-');
  const stripped = cleaned.replace(/[^A-Z0-9]/g, '');

  // Short model format: CFI-XXXXR (e.g. CFI-1215A)
  if (stripped.match(/^(CFI?)\d{0,5}[A-Z]?$/) && stripped.length <= 9) {
    if (stripped.length <= 3) return stripped;
    const prefix = stripped.startsWith('CFI') ? 'CFI' : stripped.substring(0, 3);
    const rest = stripped.substring(prefix.length);
    if (rest.length === 0) return prefix;
    return `${prefix}-${rest}`;
  }

  // Barcode format: S01-XXXXX...
  if (stripped.startsWith('S01')) {
    const parts = stripped.substring(3);
    if (parts.length === 0) return 'S01';
    return `S01-${parts}`;
  }

  // CFI long format
  if (stripped.startsWith('CFI')) {
    if (stripped.length <= 3) return stripped;
    const rest = stripped.substring(3);
    if (rest.length <= 5) return `CFI-${rest}`;
    return `CFI-${rest}`;
  }

  return input.toUpperCase().trim();
}

/**
 * Parse month character to number.
 * 1-9 = January-September, A=October, B=November, C=December
 */
export function parseMonthChar(char: string): number {
  const upper = char.toUpperCase();
  if (upper >= '1' && upper <= '9') {
    return parseInt(upper, 10);
  }
  switch (upper) {
    case 'A': return 10;
    case 'B': return 11;
    case 'C': return 12;
    default: return 0;
  }
}

/**
 * Map chassis digit to CFI series string.
 */
function chassisToSeries(chassisDigit: number, year: number): string {
  switch (chassisDigit) {
    case 1:
      // Could be CFI-10xx (FAT 1st gen) or CFI-70xx (Pro 1st gen)
      if (year >= 2024) return 'CFI-70xx';
      return 'CFI-10xx';
    case 2:
      // Could be CFI-11xx (FAT 2nd gen) or CFI-71xx (Pro 2nd gen)
      if (year >= 2025) return 'CFI-71xx';
      return 'CFI-11xx';
    case 3: return 'CFI-12xx';
    case 4: return 'CFI-20xx';
    case 5: return 'CFI-21xx';
    default: return `CFI-?${chassisDigit}xx`;
  }
}

/**
 * Map factory code to manufacturing country.
 */
function factoryToCountry(code: string): string {
  switch (code.toUpperCase()) {
    case 'E':
    case 'F':
    case 'G': return 'China';
    case 'M': return 'Malaysia';
    case 'K': return 'Japan';
    default: return 'Unknown';
  }
}

/**
 * Parse a PS5 serial number and extract its components.
 *
 * Supports:
 * 1. S01 barcode format (box sticker): S01-F448xxxxxxxxx
 * 2. Short model code: CFI-1215A
 *
 * Returns null if none match.
 */
export function parseSerial(raw: string): SerialParseResult | null {
  const normalized = normalizeSerial(raw);

  // Try short model format first (e.g., CFI-1215A)
  const shortMatch = normalized.match(SHORT_MODEL_PATTERN);
  if (shortMatch) {
    const [, , modelNum, region] = shortMatch;
    return {
      isValid: true,
      modelCode: `CFI-${modelNum}${region}`,
      modelVariant: modelNum,
      yearManufactured: 0,
      monthManufactured: 0,
      weekManufactured: 0,
      region: region,
      factory: 'unknown',
      raw: normalized,
    };
  }

  // Try S01 barcode format
  const s01Match = normalized.match(S01_PATTERN);
  if (s01Match) {
    const [, factoryCode, chassisStr, yearStr, monthChar, rest] = s01Match;
    const chassisDigit = parseInt(chassisStr, 10);
    const yearDigit = parseInt(yearStr, 10);
    const year = 2020 + yearDigit;
    const month = parseMonthChar(monthChar);
    const series = chassisToSeries(chassisDigit, year);

    // Build the 3-char lookup key: [chassis][year][month]
    // e.g. chassis=2, year=1, month=4 → "214"
    const lookupKey = `${chassisStr}${yearStr}${monthChar.toUpperCase()}`;

    return {
      isValid: true,
      modelCode: series,
      modelVariant: lookupKey,
      yearManufactured: year,
      monthManufactured: month,
      weekManufactured: 0,
      region: factoryCode.toUpperCase(),
      factory: factoryToCountry(factoryCode),
      raw: normalized,
    };
  }

  return null;
}

/**
 * Validate that a raw serial string has a recognizable format.
 */
export function isValidFormat(raw: string): boolean {
  const normalized = normalizeSerial(raw);
  return (
    SHORT_MODEL_PATTERN.test(normalized) ||
    S01_PATTERN.test(normalized)
  );
}

/**
 * Get a human-readable format hint for the expected serial number.
 */
export function getFormatHint(): string {
  return 'S01-G2A211W9D1234 or CFI-1215A';
}
