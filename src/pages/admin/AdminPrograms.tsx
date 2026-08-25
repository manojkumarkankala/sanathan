import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner, EmptyState } from '@/components/States';
import type { FestivalProgram, FestivalYear } from '@/lib/types';

const CATEGORIES = ['Puja', 'Cultural Programs', 'Dance', 'Music', 'Bhajans', 'Youth Activities', 'Sports', 'Community Service', 'Food Distribution', 'Village Clean-up', 'Special Guests'];

export function AdminPrograms() {
  const [programs, setPrograms] = useState<FestivalProgram[]>([]);
  const [years, setYears] = useState<FestivalYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase.from('festival_years').select('*').order('year', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) { setYears(data); setSelectedYear(data[0].id); }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    supabase.from('festival_programs').select('*').eq('festival_year_id', selectedYear).order('created_at').then(({ data }) => setPrograms(data || []));
  }, [selectedYear]);

  async function handleDelete(p: FestivalProgram) {
    if (!confirm('Delete this program?')) return;
    await supabase.from('festival_programs').delete().eq('id', p.id);
    setPrograms(programs.filter(x => x.id !== p.id));
  }

  if (loading) return <LoadingSpinner label="Loading programs..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Programs</h1>
          <p className="text-maroon/50 text-sm mt-1">Manage special programs per year</p>
        </div>
        {selectedYear && <button onClick={() => setShowForm(true)} className="btn-festival"><Plus size={18} /> Add Program</button>}
      </div>

      {years.length > 0 && (
        <div className="mb-6">
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="input-festival max-w-xs">
            {years.map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
          </select>
        </div>
      )}

      {programs.length === 0 ? (
        <EmptyState icon={Sparkles} title="No Programs" message="Add programs for the selected year." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map(p => (
            <div key={p.id} className="card-festival overflow-hidden">
              {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-24 object-cover" />}
              <div className="p-4">
                <span className="badge-festival bg-primary-100 text-primary-700 text-[10px] mb-1">{p.category}</span>
                <h3 className="font-heading font-bold text-maroon text-sm">{p.title}</h3>
                <p className="text-maroon/50 text-xs mt-1">{p.date} • {p.time}</p>
                <p className="text-maroon/40 text-xs">{p.location}</p>
                <div className="flex justify-end mt-2">
                  <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg bg-accent-50 text-accent-600 hover:bg-accent-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <ProgramForm yearId={selectedYear} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); supabase.from('festival_programs').select('*').eq('festival_year_id', selectedYear).order('created_at').then(({ data }) => setPrograms(data || [])); }} />}
    </div>
  );
}

function ProgramForm({ yearId, onClose, onSaved }: { yearId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', location: '', image_url: '', category: 'Cultural Programs' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('festival_programs').insert({ ...form, festival_year_id: yearId });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-cream rounded-3xl shadow-2xl max-w-lg w-full my-8" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between border-b border-primary-100">
          <h2 className="font-display font-bold text-xl text-maroon">Add Program</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-primary-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-festival" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-festival resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Date</label>
              <input type="text" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-festival" placeholder="Aug 30, 2026" />
            </div>
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Time</label>
              <input type="text" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="input-festival" placeholder="09:00 AM" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Location</label>
              <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-festival" />
            </div>
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-festival">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Image URL</label>
            <input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="input-festival" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-festival flex-1">{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={onClose} className="btn-outline-festival">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
