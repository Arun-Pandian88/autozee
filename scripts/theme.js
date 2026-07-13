const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Add imports
content = content.replace(
  'import { useState, useEffect, useRef } from "react";',
  'import { useState, useEffect, useRef } from "react";\nimport { useTheme } from "@/hooks/use-theme";'
);
content = content.replace(
  '  Link2, ClipboardList, TrendingUp\n} from "lucide-react";',
  '  Link2, ClipboardList, TrendingUp, Sun, Moon\n} from "lucide-react";'
);

// 2. Add useTheme hook
content = content.replace(
  'export default function LandingPage() {\n  const [yearly, setYearly] = useState(false);',
  'export default function LandingPage() {\n  const { mode, toggleMode } = useTheme();\n  const [yearly, setYearly] = useState(false);'
);

// 3. Add toggle button in nav
content = content.replace(
  '<div className="lp-nav-right">\n            <Link href="/login"',
  '<div className="lp-nav-right">\n            <button onClick={toggleMode} className="lp-nav-theme-toggle" aria-label="Toggle theme">\n              {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}\n            </button>\n            <Link href="/login"'
);

// 4. Update styles
let stylesStart = content.indexOf('<style>{`');
let styles = content.substring(stylesStart);

// Inject variables
styles = styles.replace(
  '.lp-root {\n          position: relative; min-height: 100vh;',
  `.lp-root {
          --lp-bg: #07090f;
          --lp-fg: #e2e8f0;
          --lp-fg-strong: #f8fafc;
          --lp-nav-bg: rgba(7,9,15,0.85);
          --lp-border: rgba(255,255,255,0.06);
          --lp-border-light: rgba(255,255,255,0.15);
          --lp-card-bg: rgba(255,255,255,0.025);
          --lp-card-hover: rgba(255,255,255,0.05);
          --lp-mockup-bg: #0d1422;
          --lp-mockup-bar: #111827;
          --lp-muted: rgba(148,163,184,0.7);
          
          position: relative; min-height: 100vh;`
);

// Inject light mode variables
styles = styles.replace(
  '.lp-noise {',
  `html[data-mode="light"] .lp-root {
          --lp-bg: #ffffff;
          --lp-fg: #334155;
          --lp-fg-strong: #0f172a;
          --lp-nav-bg: rgba(255,255,255,0.85);
          --lp-border: rgba(0,0,0,0.08);
          --lp-border-light: rgba(0,0,0,0.15);
          --lp-card-bg: rgba(0,0,0,0.02);
          --lp-card-hover: rgba(0,0,0,0.05);
          --lp-mockup-bg: #f8fafc;
          --lp-mockup-bar: #f1f5f9;
          --lp-muted: rgba(71,85,105,0.8);
        }
        
        .lp-nav-theme-toggle {
          background: transparent; border: none; color: var(--lp-fg);
          cursor: pointer; padding: 0.4rem; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .lp-nav-theme-toggle:hover { background: var(--lp-card-hover); color: var(--lp-fg-strong); }
        
        .lp-noise {`
);

// Apply variables globally
styles = styles.replace(/#07090f/g, 'var(--lp-bg)');
styles = styles.replace(/#e2e8f0/g, 'var(--lp-fg)');
styles = styles.replace(/#f8fafc/g, 'var(--lp-fg-strong)');
styles = styles.replace(/#f1f5f9/g, 'var(--lp-fg-strong)');
styles = styles.replace(/rgba\(255,255,255,0\.06\)/g, 'var(--lp-border)');
styles = styles.replace(/rgba\(255,255,255,0\.05\)/g, 'var(--lp-border)');
styles = styles.replace(/rgba\(255,255,255,0\.04\)/g, 'var(--lp-border)');
styles = styles.replace(/rgba\(255,255,255,0\.07\)/g, 'var(--lp-border)');
styles = styles.replace(/rgba\(255,255,255,0\.08\)/g, 'var(--lp-border)');
styles = styles.replace(/rgba\(255,255,255,0\.1\)/g, 'var(--lp-border-light)');
styles = styles.replace(/rgba\(255,255,255,0\.025\)/g, 'var(--lp-card-bg)');
styles = styles.replace(/rgba\(255,255,255,0\.03\)/g, 'var(--lp-card-bg)');
styles = styles.replace(/rgba\(7,9,15,0\.85\)/g, 'var(--lp-nav-bg)');
styles = styles.replace(/#0d1422/g, 'var(--lp-mockup-bg)');
styles = styles.replace(/#111827/g, 'var(--lp-mockup-bar)');
styles = styles.replace(/#040608/g, 'var(--lp-bg)');

// Some specific fixes
styles = styles.replace(/background: rgba\(7,9,15,0\.95\);/g, 'background: var(--lp-bg);');
styles = styles.replace(/border: 2px solid var\(--lp-bg\);/g, 'border: 2px solid var(--lp-bg);');

// Handle rgba colors that need to flip
styles = styles.replace(/color: rgba\(148,163,184,0\.7\)/g, 'color: var(--lp-muted)');
styles = styles.replace(/color: rgba\(148,163,184,0\.65\)/g, 'color: var(--lp-muted)');
styles = styles.replace(/color: rgba\(148,163,184,0\.55\)/g, 'color: var(--lp-muted)');
styles = styles.replace(/color: rgba\(148,163,184,0\.5\)/g, 'color: var(--lp-muted)');
styles = styles.replace(/color: rgba\(148,163,184,0\.45\)/g, 'color: var(--lp-muted)');

content = content.substring(0, stylesStart) + styles;

fs.writeFileSync('src/app/page.tsx', content);
console.log('Successfully added light/dark mode support.');
