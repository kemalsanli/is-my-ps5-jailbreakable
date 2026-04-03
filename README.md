# Is my PS5 Jailbreakable?

[![CI](https://github.com/kemalsanli/is-my-ps5-jailbreakable/actions/workflows/ci.yml/badge.svg)](https://github.com/kemalsanli/is-my-ps5-jailbreakable/actions/workflows/ci.yml)
[![Deploy](https://github.com/kemalsanli/is-my-ps5-jailbreakable/actions/workflows/deploy.yml/badge.svg)](https://github.com/kemalsanli/is-my-ps5-jailbreakable/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Check if your PlayStation 5 can be jailbroken by entering its serial number.

🌐 **Live**: [controlserial.com](https://controlserial.com) | [kemalsanli.github.io/is-my-ps5-jailbreakable](https://kemalsanli.github.io/is-my-ps5-jailbreakable/)

---

## ✨ Features

- **Serial Number Analysis** — Enter your PS5 serial number and instantly get a firmware estimation
- **Multi-language Support** — Available in 7 languages: English, Türkçe, 日本語, Deutsch, Français, Español, Italiano
- **PS5-inspired UI** — Dark theme design inspired by the PlayStation 5 interface
- **Offline Capable** — All logic runs client-side, no data is sent to any server
- **Mobile Friendly** — Fully responsive design that works on all devices
- **SEO Optimized** — Proper meta tags, structured data, and sitemap

## 📊 How It Works

PS5 consoles ship with a factory-installed firmware that corresponds to their manufacturing date. By decoding the serial number, we can estimate the firmware version and check if it falls within the range of known exploits.

**Data source**: [PSDevWiki PS5 Serial Number Guide](https://www.psdevwiki.com/ps5/Serial_Number_guide)

### Serial Number Format

```
S01-G2[Variant][Year][Month][Factory][Sequence]

Example: S01-G2A211W9D1234
         ├──┤ │ ││ │ │ └── Sequence
         │   │ ││ │ └───── Factory
         │   │ ││ └──────── Month (1-9, A-C)
         │   │ │└─────────── Year (21 = 2021)
         │   │ └──────────── Variant/Region
         │   └──────────────── PS5 Prefix
         └─────────────────── Barcode ID
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:unit

# Watch mode
npm run test:watch
```

### Build

```bash
# Production build (static export)
npm run build

# Output in ./out directory
```

## 🏗 Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Next.js 14](https://nextjs.org/) | React framework with static export |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Vitest](https://vitest.dev/) | Unit testing |
| [React Testing Library](https://testing-library.com/) | Component testing |
| [Zod](https://zod.dev/) | Schema validation |

## 📁 Project Structure

```
src/
├── app/                    # Next.js pages & layouts
├── components/             # React components
│   ├── ui/                # Reusable UI primitives
│   ├── SerialForm.tsx     # Main serial input form
│   ├── ResultDisplay.tsx  # Firmware check result
│   ├── GuideImages.tsx    # Serial location guide
│   ├── LanguageSelector   # i18n language picker
│   └── Footer.tsx         # Site footer
├── lib/
│   ├── serial-validator/  # Core validation engine
│   │   ├── index.ts       # Main API
│   │   ├── formats.ts     # Serial format parsing
│   │   ├── firmware-detector.ts  # FW estimation
│   │   └── regions.ts     # Region definitions
│   └── i18n/             # Internationalization
├── types/                # TypeScript definitions
└── styles/               # Global CSS

tests/                    # Test suites
docs/                     # Documentation
public/
├── locales/             # Translation JSON files
└── images/              # Static assets
```

## 🌍 Translations

Currently supported languages:

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Complete |
| Türkçe | `tr` | ✅ Complete |
| 日本語 | `ja` | ✅ Complete |
| Deutsch | `de` | ✅ Complete |
| Français | `fr` | ✅ Complete |
| Español | `es` | ✅ Complete |
| Italiano | `it` | ✅ Complete |

Want to add a new language? See [Contributing](docs/CONTRIBUTING.md).

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## 📝 Credits

This project is made possible by the PS5 homebrew community. Full credits and attributions can be found in [CREDITS.md](docs/CREDITS.md).

**Key contributors and data sources:**

- [PSDevWiki](https://www.psdevwiki.com) — Serial number research data
- [MODDED WARFARE](https://www.youtube.com/channel/UCm9COMxXKm05BQWNv-IpyPg) — PS5 jailbreak information
- [Mc Kuc](https://www.youtube.com/channel/UCYXUe7VF9KN-ASABNHN0pCw) — Technical documentation
- The PS5 homebrew community (TheFlow, ChendoChap, Specter, and many more)

## ⚠️ Disclaimer

This tool provides **estimations only**. The actual firmware may differ from the prediction. Always verify the firmware version directly on the console before making a purchase. This tool is for **educational and research purposes only**. The creators do not encourage piracy or illegal activities.

PlayStation, PS5, and related marks are trademarks of Sony Interactive Entertainment Inc.

## 📄 License

[MIT License](LICENSE) — Copyright © 2022-2026 Kemal Sanlı
