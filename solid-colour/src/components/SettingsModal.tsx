import { Moon, Sun, Trash2, Github, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { DotMark } from './brand/DotMark';
import { APP_VERSION } from '../constants/version';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import styles from './SettingsModal.module.css';

const Toggle = ({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={value}
    aria-label={label}
    className={`${styles.toggle} ${value ? styles.toggleOn : ''}`}
    onClick={() => onChange(!value)}
  >
    <span className={styles.toggleHandle} />
  </button>
);

export const SettingsModal = () => {
  const isSettingsOpen = useAppStore((s) => s.isSettingsOpen);
  const closeSettings = useAppStore((s) => s.closeSettings);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);
  const favorites = useAppStore((s) => s.favorites);
  const clearFavorites = useAppStore((s) => s.clearFavorites);
  const recentSearches = useAppStore((s) => s.recentSearches);
  const clearRecentSearches = useAppStore((s) => s.clearRecentSearches);
  const showToast = useAppStore((s) => s.showToast);

  return (
    <Dialog open={isSettingsOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent className={styles.content}>
        <DialogHeader className={styles.head}>
          <DialogTitle className={styles.title}>Settings</DialogTitle>
          <DialogDescription className={styles.description}>
            Appearance and what Garden keeps on this device.
          </DialogDescription>
        </DialogHeader>

        <section className={styles.section}>
          <div className="eyebrow">Appearance</div>
          <Tabs value={theme} onValueChange={(v) => v !== theme && toggleTheme()}>
            <TabsList className={styles.themeList} aria-label="Theme">
              <TabsTrigger value="dark" className={styles.themeTab}>
                <Moon /> Dark
              </TabsTrigger>
              <TabsTrigger value="light" className={styles.themeTab}>
                <Sun /> Light
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowTitle}>Reduced motion</span>
              <p>Stops the loaders and card transitions from animating</p>
            </div>
            <Toggle value={reducedMotion} onChange={setReducedMotion} label="Reduced motion" />
          </div>
        </section>

        <Separator />

        <section className={styles.section}>
          <div className="eyebrow">Stored on this device</div>
          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowTitle}>Favourite colours</span>
              <p>{favorites.length} saved</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={favorites.length === 0}
              onClick={() => {
                clearFavorites();
                showToast('Favourites cleared', 'info');
              }}
            >
              <Trash2 /> Clear
            </Button>
          </div>
          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowTitle}>Recent searches</span>
              <p>{recentSearches.length} remembered in the command palette</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={recentSearches.length === 0}
              onClick={() => {
                clearRecentSearches();
                showToast('Recent searches cleared', 'info');
              }}
            >
              <Trash2 /> Clear
            </Button>
          </div>
        </section>

        <Separator />

        <section className={styles.about}>
          <DotMark size={28} />
          <div className={styles.aboutText}>
            <span className={styles.aboutName}>Garden</span>
            <span className={styles.aboutVersion}>v{APP_VERSION}</span>
            <p>
              Stunning, not slop. Garden finds the design worth using, judged from live web search
              and real reviews, and checks every link before you see it.
            </p>
            <Button asChild variant="link" size="xs" className={styles.aboutLink}>
              <a href="https://github.com/Adi-gitX/colour-fun" target="_blank" rel="noreferrer noopener">
                <Github /> Source <ArrowUpRight />
              </a>
            </Button>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
};
