export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type JailbreakStatus = 'JAILBREAKABLE' | 'NOT_JAILBREAKABLE' | 'UNCERTAIN';

export interface SerialParseResult {
  isValid: boolean;
  modelCode: string;
  modelVariant: string;
  yearManufactured: number;
  monthManufactured: number;
  weekManufactured: number;
  region: string;
  factory: string;
  raw: string;
}

export interface FirmwareDetectionResult {
  status: JailbreakStatus;
  firmware: string;
  confidence: Confidence;
  description: string;
  modelCode: string;
  yearManufactured: number;
  monthManufactured: number;
  region: string;
}

export interface FirmwareRule {
  modelCode: string;
  yearMin: number;
  yearMax: number;
  monthMin?: number;
  monthMax?: number;
  weekMax?: number;
  maxFirmware: string;
  confidence: Confidence;
  status: JailbreakStatus;
}

export interface RegionInfo {
  code: string;
  name: string;
  factoryCode: string;
}

export type Locale = 'en' | 'tr' | 'ja' | 'de' | 'fr' | 'es' | 'it' | 'zh' | 'ru' | 'pt' | 'ko' | 'ar' | 'pl' | 'nl' | 'hi' | 'sv' | 'no' | 'fi' | 'da' | 'cs' | 'hu' | 'ro' | 'id' | 'vi' | 'th' | 'uk';

export interface LanguageInfo {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
}

export interface Translations {
  common: {
    title: string;
    description: string;
    check: string;
    clear: string;
    loading: string;
    serialNumber: string;
    learnMore: string;
  };
  form: {
    label: string;
    placeholder: string;
    hint: string;
    invalidFormat: string;
    tooShort: string;
    required: string;
  };
  results: {
    jailbreakable: {
      title: string;
      firmware: string;
      description: string;
    };
    notJailbreakable: {
      title: string;
      firmware: string;
      description: string;
    };
    uncertain: {
      title: string;
      firmware: string;
      description: string;
    };
    confidence: {
      high: string;
      medium: string;
      low: string;
    };
    detectedRegion: string;
    detectedModel: string;
    manufacturedYear: string;
  };
  guide: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  about: {
    title: string;
    whatIsThis: string;
    whatIsThisDesc: string;
    howItWorks: string;
    howItWorksDesc: string;
    disclaimer: string;
    disclaimerDesc: string;
  };
  footer: {
    credits: string;
    github: string;
    license: string;
    madeWith: string;
    inspiredBy: string;
    dataFrom: string;
  };
  seo: {
    pageTitle: string;
    pageDescription: string;
    ogTitle: string;
    ogDescription: string;
  };
}
