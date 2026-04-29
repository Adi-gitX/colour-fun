#!/bin/bash
cd /Users/kammatiaditya/solidbackgrounds

# 1
git add solid-colour/index.html
git commit -m "feat: update index HTML structure"

# 2
git add solid-colour/package.json solid-colour/vite.config.ts
git commit -m "chore: update package dependencies and vite config"

# 3
git add solid-colour/src/App.css solid-colour/src/App.tsx
git commit -m "feat: update main App component and styles"

# 4
git add solid-colour/src/components/ColorGrid.module.css solid-colour/src/components/ColorGrid.tsx
git commit -m "feat: update ColorGrid component"

# 5
git add solid-colour/src/components/ColorPicker.module.css
git commit -m "style: update ColorPicker styles"

# 6
git add solid-colour/src/components/DownloadModal.module.css
git commit -m "style: update DownloadModal styles"

# 7
git add solid-colour/src/components/GradientGenerator.module.css
git commit -m "style: update GradientGenerator styles"

# 8
git add solid-colour/src/components/Header.module.css solid-colour/src/components/Header.tsx
git commit -m "feat: update Header component"

# 9
git add solid-colour/src/components/ImageGallery.module.css
git commit -m "style: update ImageGallery styles"

# 10
git add solid-colour/src/components/ReloadPrompt.module.css
git commit -m "style: update ReloadPrompt styles"

# 11
git add solid-colour/src/components/SettingsModal.css solid-colour/src/components/SettingsModal.tsx
git commit -m "feat: update SettingsModal component"

# 12
git add solid-colour/src/components/Sidebar.module.css solid-colour/src/components/Sidebar.tsx
git commit -m "feat: update Sidebar component"

# 13
git add solid-colour/src/components/Toast.module.css
git commit -m "style: update Toast styles"

# 14
git add solid-colour/src/components/index.ts solid-colour/src/components/placeholders/ComingSoon.tsx
git commit -m "feat: update component exports and ComingSoon placeholder"

# 15
git add solid-colour/src/index.css
git commit -m "style: update global styles"

# 16
git add solid-colour/src/store/appStore.ts
git commit -m "refactor: update app state store"

# 17
git rm solid-colour/src/components/Hero.module.css solid-colour/src/components/Hero.tsx
git commit -m "refactor: remove Hero component"

# 18
git rm solid-colour/src/components/__tests__/App.integration.test.tsx solid-colour/src/components/__tests__/ColorGrid.integration.test.tsx solid-colour/src/components/__tests__/DownloadModal.integration.test.tsx solid-colour/src/components/__tests__/Header.integration.test.tsx
git commit -m "test: remove component tests"

# 19
git rm solid-colour/src/data/__tests__/colors.test.ts solid-colour/src/store/__tests__/appStore.test.ts solid-colour/src/utils/__tests__/colorUtils.test.ts solid-colour/src/utils/__tests__/imageGenerator.test.ts
git commit -m "test: remove data and utility tests"

# 20
git add devops/actions/deploy-to-ec2.yml
git commit -m "ci: add deploy to EC2 action"

# 21
git add package.json package-lock.json
git commit -m "chore: add root package configurations"

# 22
git add solid-colour/src/components/ComponentCard.module.css solid-colour/src/components/ComponentCard.tsx
git commit -m "feat: add ComponentCard"

# 23
git add solid-colour/src/components/DiscoverCard.module.css solid-colour/src/components/DiscoverCard.tsx
git commit -m "feat: add DiscoverCard"

# 24
git add solid-colour/src/components/views/
git commit -m "feat: add views components"

# 25
git add solid-colour/src/data/components.ts solid-colour/src/data/designSystems.ts solid-colour/src/data/inspiration.ts solid-colour/src/data/libraries.ts solid-colour/src/data/tools.ts
git commit -m "feat: add new data files for resources"

# Final catch-all, just in case
git add .
git commit -m "chore: commit remaining changes" || echo "No remaining changes"

# Push
git push
