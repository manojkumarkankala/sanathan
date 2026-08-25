import { useEffect, useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item: { key: string; value: string }) => { map[item.key] = item.value; });
        setSettings(map);
      }
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const entries = Object.entries(settings);
    for (const [key, value] of entries) {
      await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const fields = [
    { key: 'about_text', label: 'About Text', type: 'textarea' },
    { key: 'contact_email', label: 'Contact Email', type: 'text' },
    { key: 'contact_phone', label: 'Contact Phone', type: 'text' },
    { key: 'contact_address', label: 'Contact Address', type: 'text' },
    { key: 'facebook_url', label: 'Facebook URL', type: 'text' },
    { key: 'instagram_url', label: 'Instagram URL', type: 'text' },
    { key: 'youtube_url', label: 'YouTube URL', type: 'text' },
    { key: 'whatsapp_url', label: 'WhatsApp URL', type: 'text' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Website Settings</h1>
          <p className="text-maroon/50 text-sm mt-1">Manage site-wide content and social links</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-4">
        {fields.map(field => (
          <div key={field.key}>
            <label className="text-sm font-heading text-maroon/70 block mb-1">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                rows={4}
                value={settings[field.key] || ''}
                onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                className="input-festival resize-none"
              />
            ) : (
              <input
                type="text"
                value={settings[field.key] || ''}
                onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                className="input-festival"
              />
            )}
          </div>
        ))}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-festival">
            {saving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
          </button>
          {saved && <span className="text-success-600 font-heading font-semibold text-sm flex items-center gap-1"><Check size={16} /> Saved!</span>}
        </div>
      </form>
    </div>
  );
}
