import { useState, useEffect } from 'react';
import { ArrowLeft, Monitor, Cpu, Globe, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import { useToast } from '../components/Toast';
import NamingFormatInput from '../components/NamingFormatInput';
import useDownloadConfig from '../hooks/useDownloadConfig';

const BASE_URL = 'http://localhost:8000';
const LANG_OPTIONS = [
  { value: 'en', labelKey: 'settings.general.language.en' },
  { value: 'zh', labelKey: 'settings.general.language.zh' },
];

export default function SettingsPage() {
  const { locale, setLocale, t } = useLocale();
  const { addToast } = useToast();
  const { format, setFormat } = useDownloadConfig();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/api/settings`)
      .then(r => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  const handleBackendSettingChange = async (key, value) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      setSettings(updated);
      addToast(t('settings.toast.saved'), 'success');
    } catch {
      setSettings(prev => prev ? { ...prev, [key]: !value } : prev);
      addToast(t('settings.toast.saveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary">
      <header className="sticky top-0 z-40 border-b border-edge-primary bg-surface-primary/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg hover:bg-surface-tertiary text-content-tertiary hover:text-content-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">{t('settings.heading')}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* General */}
        <section>
          <h2 className="text-sm font-semibold text-content-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            {t('settings.general.heading')}
          </h2>
          <div className="bg-surface-secondary rounded-2xl border border-edge-secondary divide-y divide-edge-subtle">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-content-tertiary" />
                <span className="text-sm font-medium text-content-primary">{t('settings.general.language')}</span>
              </div>
              <select
                value={locale}
                onChange={e => setLocale(e.target.value)}
                className="px-3 py-2 rounded-lg bg-surface-tertiary border border-edge-secondary text-sm text-content-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors cursor-pointer"
              >
                {LANG_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Image Indexing */}
        <section>
          <h2 className="text-sm font-semibold text-content-secondary uppercase tracking-wide mb-1 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            {t('settings.indexing.heading')}
          </h2>
          <p className="text-xs text-content-muted mb-4 ml-6">
            {t('settings.indexing.description')}
          </p>
          <div className="bg-surface-secondary rounded-2xl border border-edge-secondary divide-y divide-edge-subtle">
            {/* Auto-tag toggle */}
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <span className="text-sm font-medium text-content-primary">{t('settings.indexing.autoTag')}</span>
                <p className="text-xs text-content-muted mt-0.5">{t('settings.indexing.autoTagDesc')}</p>
              </div>
              <button
                role="switch"
                aria-checked={settings?.auto_tag ?? true}
                disabled={saving || !settings}
                onClick={() => handleBackendSettingChange('auto_tag', !(settings?.auto_tag ?? true))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4 ${
                  (settings?.auto_tag ?? true) ? 'bg-accent' : 'bg-gray-400 dark:bg-gray-600'
                } ${saving ? 'opacity-50 cursor-wait' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    (settings?.auto_tag ?? true) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* GPU toggle */}
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <span className="text-sm font-medium text-content-primary">{t('settings.indexing.gpu')}</span>
                <p className="text-xs text-content-muted mt-0.5">{t('settings.indexing.gpuDesc')}</p>
              </div>
              <button
                role="switch"
                aria-checked={settings?.gpu_enabled ?? false}
                disabled={saving || !settings}
                onClick={() => handleBackendSettingChange('gpu_enabled', !(settings?.gpu_enabled ?? false))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4 ${
                  (settings?.gpu_enabled ?? false) ? 'bg-accent' : 'bg-gray-400 dark:bg-gray-600'
                } ${saving ? 'opacity-50 cursor-wait' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    (settings?.gpu_enabled ?? false) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Download Settings */}
        <section>
          <h2 className="text-sm font-semibold text-content-secondary uppercase tracking-wide mb-1 flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('settings.download.heading')}
          </h2>
          <p className="text-xs text-content-muted mb-4 ml-6">
            {t('settings.download.description')}
          </p>
          <div className="bg-surface-secondary rounded-2xl border border-edge-secondary divide-y divide-edge-subtle">
            <div className="px-5 py-4">
              <div>
                <span className="text-sm font-medium text-content-primary">{t('settings.download.namingFormat')}</span>
                <p className="text-xs text-content-muted mt-0.5 mb-3">{t('settings.download.namingFormatDesc')}</p>
              </div>
              <NamingFormatInput
                value={format}
                onChange={setFormat}
                placeholder={t('settings.download.namingFormatPlaceholder')}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
