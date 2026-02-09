# colour-fun

A monorepo containing a modern background generator web application and DevOps learning resources.

---

## Repository Structure

```
solidbackgrounds/
│
├── app/                        # Frontend Application
│   ├── src/
│   │   ├── components/         # React UI Components
│   │   │   ├── ColorGrid.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── GradientGenerator.tsx
│   │   │   ├── DownloadModal.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ...
│   │   ├── store/              # State Management (Zustand)
│   │   ├── utils/              # Helper Functions
│   │   │   ├── colorUtils.ts
│   │   │   └── imageGenerator.ts
│   │   └── data/               # Static Data
│   ├── public/                 # Static Assets
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── devops/                     # DevOps Resources
│   ├── classNotes/             # Daily Learning Notes
│   │   ├── Class2.md
│   │   ├── class3.md           # Linux & AWS EC2 Essentials
│   │   ├── class4.md
│   │   ├── class5.md
│   │   └── class6.md
│   └── scripts/                # Automation Scripts
│       ├── run.sh              # Setup & Environment Scripts
│       ├── run2.sh
│       └── run5.sh             # AWS EC2 Instance Launcher
│
├── .github/
│   └── workflows/              # CI/CD Pipelines
│       └── github-actions.yml
│
├── .gitignore
└── README.md
```

---

## App

Modern web application for generating solid color and gradient backgrounds.

### Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build | Vite 7 |
| State | Zustand |
| Styling | CSS Modules |
| Animations | Framer Motion |
| PWA | Vite PWA Plugin |

### Features

- Curated color palette selection
- Custom color picker with precision controls
- Gradient background generator
- High-resolution image export (1080p, 4K, custom)
- Progressive Web App support
- Responsive design

### Development

```bash
cd app
npm install
npm run dev
```

### Build

```bash
cd app
npm run build
```

Output: `app/dist/`

---

## DevOps

Learning resources and automation scripts for DevOps practices.

### Class Notes

Daily documentation covering:

- Linux fundamentals and CLI commands
- AWS EC2 instance management
- Cloud computing models (IaaS, PaaS, SaaS)
- SSH and networking basics
- Package management
- Server deployment

### Scripts

Automation scripts for common operations:

| Script | Purpose |
|--------|---------|
| `run.sh` | Environment setup and validation |
| `run2.sh` | Development utilities |
| `run5.sh` | AWS EC2 instance automation with Ubuntu 24.04 AMI |

---

## License

MIT

---

## Author

[Adi-gitX](https://github.com/Adi-gitX)
