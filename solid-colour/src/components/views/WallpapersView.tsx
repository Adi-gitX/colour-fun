import { Palette, Pipette, Search, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { Section } from '../../store/appStore';
import { colors } from '../../data/colors';
import { gradients } from '../../data/gradients';
import { imageUrls } from '../../data/images';
import { ColorGrid } from '../ColorGrid';
import { GradientGenerator } from '../GradientGenerator';
import { ImageGallery } from '../ImageGallery';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import styles from './WallpapersView.module.css';

type WallpaperSection = Extract<Section, 'solid-colors' | 'gradients' | 'backgrounds'>;

interface Tab {
  id: WallpaperSection;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  count: number;
  title: string;
  blurb: string;
}

const TABS: Tab[] = [
  {
    id: 'backgrounds',
    label: 'Images',
    icon: ImageIcon,
    count: imageUrls.length,
    title: 'Images',
    blurb:
      'High-resolution photos and abstract backgrounds from Lummi and Picsum. Open one to download the full-size file.',
  },
  {
    id: 'gradients',
    label: 'Gradients',
    icon: Sparkles,
    count: gradients.length,
    title: 'Gradients',
    blurb:
      'Start from a preset or two colours of your own, set the angle, copy the CSS or export the image.',
  },
  {
    id: 'solid-colors',
    label: 'Solid',
    icon: Palette,
    count: colors.length,
    title: 'Solid colours',
    blurb:
      'Curated flat colours plus a custom picker. Export any of them at up to 8K in PNG, JPEG or WebP.',
  },
];

const isWallpaper = (v: string): v is WallpaperSection => TABS.some((t) => t.id === v);

export function WallpapersView({ section }: { section: WallpaperSection }) {
  const setCurrentSection = useAppStore((s) => s.setCurrentSection);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const openPicker = useAppStore((s) => s.openPicker);
  const tab = TABS.find((t) => t.id === section) ?? TABS[0];

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className="eyebrow">Wallpapers</div>
        <h1 className={styles.title}>{tab.title}</h1>
        <p className={styles.blurb}>{tab.blurb}</p>
      </header>

      <Tabs
        value={section}
        onValueChange={(v) => {
          if (isWallpaper(v)) setCurrentSection(v);
        }}
        className={styles.tabs}
      >
        <div className={styles.toolbar}>
          <TabsList variant="line" className={styles.tabList} aria-label="Wallpaper type">
            {TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className={styles.tab}>
                <t.icon size={13} strokeWidth={1.75} />
                {t.label}
                <span className={styles.tabCount}>{t.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {section === 'solid-colors' && (
            <div className={styles.tools}>
              <label className={styles.search}>
                <Search size={13} strokeWidth={2} aria-hidden />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name or hex"
                  aria-label="Filter colours"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear filter"
                  >
                    <X size={12} />
                  </button>
                )}
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openPicker}
                className={styles.pickerBtn}
              >
                <Pipette /> Custom colour
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="solid-colors" className={styles.content}>
          {section === 'solid-colors' && <ColorGrid />}
        </TabsContent>
        <TabsContent value="gradients" className={styles.content}>
          {section === 'gradients' && <GradientGenerator />}
        </TabsContent>
        <TabsContent value="backgrounds" className={styles.content}>
          {section === 'backgrounds' && <ImageGallery />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
