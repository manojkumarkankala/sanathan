import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Clock, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner, EmptyState } from '@/components/States';
import type { FestivalSchedule, FestivalYear } from '@/lib/types';

export function AdminSchedules() {
  const [schedules, setSchedules] = useState<FestivalSchedule[]>([]);
  const [years, setYears] = useState<FestivalYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase.from('festival_years').select('*').order('year', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) {
        setYears(data);
        setSelectedYear(data[0].id);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    supabase.from('festival_schedules').select('*').eq('festival_year_id', selectedYear).order('sort_order').then(({ data }) => {
      setSchedules(data || []);
    });
  }, [selectedYear]);

  async function handleDelete(s: FestivalSchedule) {
    if (!confirm('Delete this schedule item?')) return;
    await supabase.from('festival_schedules').delete().eq('id', s.id);
    setSchedules(schedules.filter(x => x.id !== s.id));
  }

  if (loading) return <LoadingSpinner label="Loading schedules..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Schedules</h1>
          <p className="text-maroon/50 text-sm mt-1">Manage festival day schedules per year</p>
        </div>
        {selectedYear && <button onClick={() => setShowForm(true)} className="btn-festival"><Plus size={18} /> Add Item</button>}
      </div>

      {years.length > 0 && (
        <div className="mb-6">
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="input-festival max-w-xs">
            {years.map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
          </select>
        </div>
      )}

      {schedules.length === 0 ? (
        <EmptyState icon={Clock} title="No Schedule Items" message="Add schedule items for the selected year." />
      ) : (
        <div className="space-y-2 max-w-2xl">
          {schedules.map(s => (
            <div key={s.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-primary-600 font-heading font-bold text-sm w-24">{s.start_time}</div>
                <div>
                  <h3 className="font-heading font-semibold text-maroon text-sm">{s.title}</h3>
                  {s.description && <p className="text-maroon/50 text-xs">{s.description}</p>}
                </div>
              </div>
              <button onClick={() => handleDelete(s)} className="p-2 rounded-lg bg-accent-50 text-accent-600 hover:bg-accent-100">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && <ScheduleForm yearId={selectedYear} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); supabase.from('festival_schedules').select('*').eq('festival_year_id', selectedYear).order('sort_order').then(({ data }) => setSchedules(data || [])); }} />}
    </div>
  );
}

function ScheduleForm({ yearId, onClose, onSaved }: { yearId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', start_time: '', end_time: '', sort_order: 0 });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('festival_schedules').insert({ ...form, festival_year_id: yearId });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream rounded-3xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between border-b border-primary-100">
          <h2 className="font-display font-bold text-xl text-maroon">Add Schedule Item</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-primary-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-festival" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Description</label>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-festival" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Start Time *</label>
              <input type="text" required value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className="input-festival" placeholder="08:00 AM" />
            </div>
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">End Time</label>
              <input type="text" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className="input-festival" placeholder="09:00 AM" />
            </div>
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })} className="input-festival" />
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
