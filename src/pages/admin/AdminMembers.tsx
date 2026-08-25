import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Users, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { slugify } from '@/lib/utils';
import type { Member } from '@/lib/types';

export function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('members').select('*').order('created_at');
    if (data) setMembers(data);
    setLoading(false);
  }

  async function handleDelete(m: Member) {
    if (!confirm(`Delete ${m.name}?`)) return;
    await supabase.from('members').delete().eq('id', m.id);
    load();
  }

  async function togglePublish(m: Member) {
    await supabase.from('members').update({ published: !m.published }).eq('id', m.id);
    load();
  }

  if (loading) return <LoadingSpinner label="Loading members..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Members Management</h1>
          <p className="text-maroon/50 text-sm mt-1">{members.length} members</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-festival"><Plus size={18} /> Add Member</button>
      </div>

      {members.length === 0 ? (
        <EmptyState icon={Users} title="No Members" message="Add your first Sanathan Youth member." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(m => (
            <div key={m.id} className="card-festival p-4 flex items-start gap-3">
              <img src={m.profile_image} alt={m.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-200" />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-maroon">{m.name}</h3>
                <p className="text-primary-600 text-xs">{m.role}</p>
                <p className="text-maroon/40 text-xs mt-1">/{m.slug}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setEditing(m); setShowForm(true); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-heading">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => togglePublish(m)} className="p-1.5 rounded-lg bg-cream border border-primary-200 text-maroon" title={m.published ? 'Unpublish' : 'Publish'}>
                    {m.published ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => handleDelete(m)} className="p-1.5 rounded-lg bg-accent-50 text-accent-600 hover:bg-accent-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <MemberForm member={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function MemberForm({ member, onClose, onSaved }: { member: Member | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: member?.name || '',
    slug: member?.slug || '',
    profile_image: member?.profile_image || '',
    role: member?.role || '',
    bio: member?.bio || '',
    skills: member?.skills || '',
    achievements: member?.achievements || '',
    activities: member?.activities || '',
    festival_participation: member?.festival_participation || '',
    mobile: member?.mobile || '',
    email: member?.email || '',
    show_mobile: member?.show_mobile ?? false,
    published: member?.published ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, slug: form.slug || slugify(form.name) };
    if (member) {
      await supabase.from('members').update(data).eq('id', member.id);
    } else {
      await supabase.from('members').insert(data);
    }
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-cream rounded-3xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-cream border-b border-primary-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-xl text-maroon">{member ? 'Edit' : 'Add'} Member</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-primary-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-festival" />
            </div>
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-festival" placeholder="auto-generated" />
            </div>
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Profile Image URL</label>
            <input type="url" value={form.profile_image} onChange={e => setForm({ ...form, profile_image: e.target.value })} className="input-festival" />
            {form.profile_image && <img src={form.profile_image} alt="Preview" className="mt-2 w-20 h-20 rounded-full object-cover" />}
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Role</label>
            <input type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-festival" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Bio</label>
            <textarea rows={2} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="input-festival resize-none" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Skills (comma-separated)</label>
            <input type="text" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} className="input-festival" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Achievements (comma-separated)</label>
            <input type="text" value={form.achievements} onChange={e => setForm({ ...form, achievements: e.target.value })} className="input-festival" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Activities (comma-separated)</label>
            <input type="text" value={form.activities} onChange={e => setForm({ ...form, activities: e.target.value })} className="input-festival" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Festival Participation (comma-separated)</label>
            <input type="text" value={form.festival_participation} onChange={e => setForm({ ...form, festival_participation: e.target.value })} className="input-festival" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Mobile</label>
              <input type="text" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="input-festival" />
            </div>
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-festival" />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-heading text-maroon">
              <input type="checkbox" checked={form.show_mobile} onChange={e => setForm({ ...form, show_mobile: e.target.checked })} className="w-4 h-4" />
              Show mobile publicly
            </label>
            <label className="flex items-center gap-2 text-sm font-heading text-maroon">
              <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="w-4 h-4" />
              Published
            </label>
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
