import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Calendar, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FESTIVAL_IMAGES } from '@/lib/festivalData';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { slugify, formatDateShort, getFestivalStatus } from '@/lib/utils';
import type { FestivalYear } from '@/lib/types';

export function AdminYears() {
  const [years, setYears] = useState<FestivalYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FestivalYear | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadYears(); }, []);

  async function loadYears() {
    setLoading(true);
    const { data } = await supabase.from('festival_years').select('*').order('year', { ascending: false });
    if (data) setYears(data);
    setLoading(false);
  }

  function openAdd() { setEditing(null); setShowForm(true); }
  function openEdit(y: FestivalYear) { setEditing(y); setShowForm(true); }

  async function handleDelete(y: FestivalYear) {
    if (!confirm(`Delete ${y.title}? This will also delete all schedules, programs, photos, and videos linked to this year.`)) return;
    await supabase.from('festival_years').delete().eq('id', y.id);
    loadYears();
  }

  async function togglePublish(y: FestivalYear) {
    await supabase.from('festival_years').update({ published: !y.published }).eq('id', y.id);
    loadYears();
  }

  if (loading) return <LoadingSpinner label="Loading festival years..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Festival Years</h1>
          <p className="text-maroon/50 text-sm mt-1">Manage all Vinayaka Chavithi year celebrations</p>
        </div>
        <button onClick={openAdd} className="btn-festival">
          <Plus size={18} /> Add Year
        </button>
      </div>

      {years.length === 0 ? (
        <EmptyState icon={Calendar} title="No Festival Years" message="Add your first Vinayaka Chavithi year to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {years.map(y => {
            const status = getFestivalStatus(y.start_date, y.end_date);
            return (
              <div key={y.id} className="card-festival overflow-hidden">
                <div className="relative h-32">
                  <img src={y.banner_url || FESTIVAL_IMAGES.ganesh1} alt={y.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <h3 className="font-display font-bold text-cream text-shadow-md">{y.title}</h3>
                    <span className={`badge-festival ${status === 'live' ? 'bg-accent-500 text-white' : status === 'upcoming' ? 'bg-success-500 text-white' : 'bg-maroon/60 text-cream'}`}>
                      {status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-maroon/60 text-xs line-clamp-2 mb-3">{y.description}</p>
                  <div className="text-xs text-maroon/40 mb-3">{formatDateShort(y.start_date)} • {y.location_name}</div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(y)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-heading font-semibold">
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => togglePublish(y)} className="p-2 rounded-lg bg-cream border border-primary-200 text-maroon hover:bg-primary-50" title={y.published ? 'Unpublish' : 'Publish'}>
                      {y.published ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => handleDelete(y)} className="p-2 rounded-lg bg-accent-50 text-accent-600 hover:bg-accent-100" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <YearForm
          year={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadYears(); }}
        />
      )}
    </div>
  );
}

function YearForm({ year, onClose, onSaved }: { year: FestivalYear | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    year: year?.year || new Date().getFullYear() + 1,
    title: year?.title || '',
    slug: year?.slug || '',
    description: year?.description || '',
    banner_url: year?.banner_url || '',
    start_date: year?.start_date || '',
    end_date: year?.end_date || '',
    start_time: year?.start_time || '08:00 AM',
    end_time: year?.end_time || '10:00 PM',
    location_name: year?.location_name || '',
    address: year?.address || '',
    latitude: year?.latitude || '',
    longitude: year?.longitude || '',
    chief_guests: year?.chief_guests || '',
    organizers: year?.organizers || '',
    achievements: year?.achievements || '',
    published: year?.published ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      slug: form.slug || slugify(String(form.year)),
      latitude: form.latitude ? parseFloat(String(form.latitude)) : null,
      longitude: form.longitude ? parseFloat(String(form.longitude)) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    if (year) {
      await supabase.from('festival_years').update(data).eq('id', year.id);
    } else {
      await supabase.from('festival_years').insert(data);
    }
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-cream rounded-3xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-cream border-b border-primary-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-xl text-maroon">{year ? 'Edit' : 'Add'} Festival Year</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-primary-100 text-maroon"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Year *</label>
              <input type="number" required value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value), title: form.title || `Vinayaka Chavithi ${e.target.value}` })} className="input-festival" />
            </div>
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-festival" placeholder="auto-generated" />
            </div>
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-festival" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-festival resize-none" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Banner URL</label>
            <input type="url" value={form.banner_url} onChange={e => setForm({ ...form, banner_url: e.target.value })} className="input-festival" placeholder="https://..." />
            {form.banner_url && <img src={form.banner_url} alt="Preview" className="mt-2 rounded-xl h-24 object-cover" />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="input-festival" />
            </div>
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="input-festival" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Start Time</label>
              <input type="text" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className="input-festival" />
            </div>
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">End Time</label>
              <input type="text" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className="input-festival" />
            </div>
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Location Name</label>
            <input type="text" value={form.location_name} onChange={e => setForm({ ...form, location_name: e.target.value })} className="input-festival" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Address</label>
            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-festival" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value as string | number })} className="input-festival" />
            </div>
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value as string | number })} className="input-festival" />
            </div>
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Chief Guests</label>
            <input type="text" value={form.chief_guests} onChange={e => setForm({ ...form, chief_guests: e.target.value })} className="input-festival" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Organizers</label>
            <input type="text" value={form.organizers} onChange={e => setForm({ ...form, organizers: e.target.value })} className="input-festival" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Achievements</label>
            <input type="text" value={form.achievements} onChange={e => setForm({ ...form, achievements: e.target.value })} className="input-festival" />
          </div>
          <label className="flex items-center gap-2 text-sm font-heading text-maroon">
            <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded" />
            Published (visible on website)
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
