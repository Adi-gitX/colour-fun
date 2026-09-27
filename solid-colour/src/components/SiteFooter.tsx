import { APP_VERSION } from '../constants/version';
import { DotMark } from './brand/DotMark';

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <DotMark size={14} />
          <span>Garden</span>
          <span className="version">v{APP_VERSION}</span>
        </div>
        <p>Stunning, not slop. Every pick is searched live and checked before you see it.</p>
      </div>
    </footer>
  );
}
