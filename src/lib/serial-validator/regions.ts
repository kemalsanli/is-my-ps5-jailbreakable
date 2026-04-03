/**
 * PS5 Serial Number Region Definitions
 *
 * Based on PSDevWiki PS5 Serial Number Guide
 * https://www.psdevwiki.com/ps5/Serial_Number_guide
 *
 * Serial number prefixes and their associated regions/models.
 */

import type { RegionInfo } from '@/types/serial';

/**
 * Region mapping based on the serial number prefix character
 * after the model code. For example in "CFI-1015A", the "A"
 * indicates a US/Canada region.
 */
export const REGIONS: Record<string, RegionInfo> = {
  A: { code: 'A', name: 'United States / Canada', factoryCode: 'US' },
  B: { code: 'B', name: 'United Kingdom / Ireland', factoryCode: 'UK' },
  C: { code: 'C', name: 'Europe / Middle East / Africa', factoryCode: 'EU' },
  D: { code: 'D', name: 'Europe / Middle East / Africa', factoryCode: 'EU' },
  E: { code: 'E', name: 'Europe / Middle East / Africa', factoryCode: 'EU' },
  J: { code: 'J', name: 'Japan', factoryCode: 'JP' },
  K: { code: 'K', name: 'South Korea', factoryCode: 'KR' },
  L: { code: 'L', name: 'Latin America', factoryCode: 'LA' },
  R: { code: 'R', name: 'Russia', factoryCode: 'RU' },
  S: { code: 'S', name: 'Southeast Asia', factoryCode: 'SEA' },
  T: { code: 'T', name: 'Taiwan / Hong Kong', factoryCode: 'TW' },
  U: { code: 'U', name: 'Australia / New Zealand', factoryCode: 'AU' },
  W: { code: 'W', name: 'China', factoryCode: 'CN' },
  Z: { code: 'Z', name: 'Singapore / Malaysia', factoryCode: 'SG' },
};

/**
 * PS5 model code descriptions
 */
export const MODEL_CODES: Record<string, string> = {
  '1000': 'PS5 Disc Edition (Original, CFI-1000)',
  '1015': 'PS5 Disc Edition (CFI-1015)',
  '1016': 'PS5 Disc Edition (CFI-1016)',
  '1018': 'PS5 Disc Edition (CFI-1018)',
  '1100': 'PS5 Disc Edition (Revision, CFI-1100)',
  '1115': 'PS5 Disc Edition (CFI-1115)',
  '1116': 'PS5 Disc Edition (CFI-1116)',
  '1200': 'PS5 Disc Edition (Revision 2, CFI-1200)',
  '1215': 'PS5 Disc Edition (CFI-1215)',
  '1216': 'PS5 Disc Edition (CFI-1216)',
  '2000': 'PS5 Slim Disc Edition (CFI-2000)',
  '2015': 'PS5 Slim Disc Edition (CFI-2015)',
  '2016': 'PS5 Slim Disc Edition (CFI-2016)',
  '7000': 'PS5 Digital Edition (Original, CFI-1000 Digital)',
  '7015': 'PS5 Digital Edition (CFI-1015 Digital)',
  '7016': 'PS5 Digital Edition (CFI-1016 Digital)',
  '7100': 'PS5 Digital Edition (Revision, CFI-1100 Digital)',
  '7115': 'PS5 Digital Edition (CFI-1115 Digital)',
  '7116': 'PS5 Digital Edition (CFI-1116 Digital)',
  '7200': 'PS5 Digital Edition (Revision 2, CFI-1200 Digital)',
  '7215': 'PS5 Digital Edition (CFI-1215 Digital)',
  '7216': 'PS5 Digital Edition (CFI-1216 Digital)',
  '7000S': 'PS5 Slim Digital Edition (CFI-2000 Digital)',
  '7015S': 'PS5 Slim Digital Edition (CFI-2015 Digital)',
  '7016S': 'PS5 Slim Digital Edition (CFI-2016 Digital)',
};

/**
 * Get region info from a region code letter
 */
export function getRegionInfo(regionCode: string): RegionInfo | null {
  const code = regionCode.toUpperCase();
  return REGIONS[code] || null;
}

/**
 * Get model description from a model number
 */
export function getModelDescription(modelNumber: string): string {
  return MODEL_CODES[modelNumber] || `Unknown Model (${modelNumber})`;
}
