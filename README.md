<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA"/>
</p>

# 🎨 SolidBackgrounds

> A premium, modern web application for generating stunning solid color backgrounds with advanced customization options.

<p align="center">
  <img src="https://img.shields.io/github/license/Adi-gitX/colour-fun?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/github/stars/Adi-gitX/colour-fun?style=flat-square" alt="Stars"/>
  <img src="https://img.shields.io/github/forks/Adi-gitX/colour-fun?style=flat-square" alt="Forks"/>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Color Grid** | Browse curated, professional color palettes |
| 🖌️ **Color Picker** | Fine-tune any color with precision controls |
| 🌈 **Gradient Generator** | Create beautiful gradient backgrounds |
| 📥 **High-Res Export** | Download in multiple resolutions (1080p, 4K, custom) |
| ⚙️ **Settings Modal** | Customize app behavior and preferences |
| 📱 **PWA Support** | Install as a native app on any device |
| 🌙 **Modern UI** | Sleek, responsive interface with smooth animations |

---

## 🛠️ Tech Stack

```
Frontend        → React 19 + TypeScript
Build Tool      → Vite 7
State           → Zustand
Styling         → CSS Modules
Animations      → Framer Motion
Icons           → Lucide React
PWA             → Vite PWA Plugin
```

---

## 📁 Project Structure

```
solidbackgrounds/
├── app/                    # React Frontend Application
│   ├── src/
│   │   ├── components/     # UI Components
│   │   │   ├── ColorGrid.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── GradientGenerator.tsx
│   │   │   ├── DownloadModal.tsx
│   │   │   └── ...
│   │   ├── store/          # Zustand State Management
│   │   ├── utils/          # Helper Functions
│   │   └── data/           # Color Data
│   ├── public/             # Static Assets
│   └── dist/               # Production Build
│
├── devops/                 # DevOps Resources
│   ├── classNotes/         # Learning Documentation
│   └── scripts/            # Automation Scripts (AWS EC2)
│
└── .github/                # CI/CD Workflows
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ 
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/Adi-gitX/colour-fun.git

# Navigate to project
cd solidbackgrounds/app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Build & Deploy

```bash
# Production build
cd app && npm run build

# Preview production build
npm run preview
```

Build output will be in `app/dist/` folder.

---

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Adi-gitX">Adi-gitX</a>
</p>
