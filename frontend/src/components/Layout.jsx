import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Search, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocale } from '../contexts/LocaleContext';
import TagPromptSuggest from './TagPromptSuggest';

export default function Layout({ children, onSearch }) {
  const [query, setQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed && onSearch) onSearch(trimmed);
  };

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-edge-primary bg-surface-primary/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="text-xl font-bold tracking-tight text-content-primary hover:text-accent transition-colors">
              {t('layout.brand')}
            </a>
            <nav className="flex items-center gap-4">
              <Link to="/tags" className="text-sm text-content-tertiary hover:text-accent transition-colors">
                {t('layout.nav.tags')}
              </Link>
              <Link to="/prompts" className="text-sm text-content-tertiary hover:text-accent transition-colors">
                {t('layout.nav.prompts')}
              </Link>
              <Link to="/settings" className="text-sm text-content-tertiary hover:text-accent transition-colors">
                {t('layout.nav.settings')}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <TagPromptSuggest
                type="tag"
                value={query}
                onChange={setQuery}
                placeholder={t('layout.search.placeholder')}
                inputClassName="w-64 px-4 py-2 rounded-lg bg-surface-tertiary border border-edge-secondary text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-sm font-medium text-white shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all hover:scale-[1.03] inline-flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {t('layout.search.button')}
              </button>
            </form>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-surface-tertiary text-content-tertiary hover:text-content-primary transition-colors"
              title={theme === 'dark' ? t('layout.theme.switchToLight') : t('layout.theme.switchToDark')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
