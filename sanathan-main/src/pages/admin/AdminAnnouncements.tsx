import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Megaphone, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner, EmptyState } from '@/components/States';
import type { Announcement } from '@/lib/types';

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
    setLoading(false);
  }

  async function handleDelete(a: Announcement) {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', a.id);
    load();
  }

  async function togglePublish(a: Announcement) {
    await supabase.from('announcements').update({ published: !a.published }).eq('id', a.id);
    load();
  }

  if (loading) return <LoadingSpinner label="Loading announcements..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Announcements</h1>
          <p className="text-maroon/50 text-sm mt-1">{announcements.length} announcements</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-festival"><Plus size={18} /> Add Announcement</button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No Announcements" message="Add an announcement to display on the homepage." />
      ) : (
        <div className="space-y-3 max-w-2xl">
          {announcements.map(a => (
            <div key={a.id} className="glass-card rounded-xl p-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading font-bold text-maroon text-sm">{a.title}</h3>
                  <span className={`badge-festival text-[10px] ${a.published ? 'bg-success-100 text-success-700' : 'bg-maroon/10 text-maroon/40'}`}>
                    {a.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-maroon/60 text-xs line-clamp-2">{a.content}</p>
                <p className="text-maroon/30 text-xs mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => togglePublish(a)} className="p-2 rounded-lg bg-cream border border-primary-200 text-maroon" title={a.published ? 'Unpublish' : 'Publish'}>
                  {a.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => handleDelete(a)} className="p-2 rounded-lg bg-accent-50 text-accent-600 hover:bg-accent-100">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <AnnForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function AnnForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', content: '', published: true });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('announcements').insert(form);
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream rounded-3xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between border-b border-primary-100">
          <h2 className="font-display font-bold text-xl text-maroon">Add Announcement</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-primary-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-festival" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Content *</label>
            <textarea rows={4} required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="input-festival resize-none" />
          </div>
          <label className="flex items-center gap-2 text-sm font-heading text-maroon">
            <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="w-4 h-4" />
            Publish immediately
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-festival flex-1">{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={onClose} className="btn-outline-festival">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
