import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, X, Image as ImageIcon, Upload, CheckCircle2, FileImage, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner, EmptyState } from '@/components/States';
import type { Photo, FestivalYear } from '@/lib/types';

const CATEGORIES = ['Ganesh Idol', 'Decorations', 'Puja', 'Procession', 'Cultural Programs', 'Youth Activities', 'Community Activities', 'Special Moments', 'Festival Night', 'Dance', 'Music', 'Food/Prasadam'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function AdminPhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [years, setYears] = useState<FestivalYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [yearFilter, setYearFilter] = useState('All');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: ph }, { data: yr }] = await Promise.all([
      supabase.from('photos').select('*').order('created_at', { ascending: false }),
      supabase.from('festival_years').select('*').order('year', { ascending: false }),
    ]);
    if (ph) setPhotos(ph);
    if (yr) setYears(yr);
    setLoading(false);
  }

  async function handleDelete(p: Photo) {
    if (!confirm('Delete this photo?')) return;
    await supabase.from('photos').delete().eq('id', p.id);
    load();
  }

  const filtered = yearFilter === 'All' ? photos : photos.filter(p => String(p.year) === yearFilter);

  if (loading) return <LoadingSpinner label="Loading photos..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Gallery Management</h1>
          <p className="text-maroon/50 text-sm mt-1">{photos.length} photos total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-festival"><Plus size={18} /> Add Photo</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setYearFilter('All')} className={`px-3 py-1 rounded-full text-xs font-heading ${yearFilter === 'All' ? 'bg-primary-500 text-white' : 'bg-white text-maroon/60'}`}>All</button>
        {years.map(y => (
          <button key={y.id} onClick={() => setYearFilter(String(y.year))} className={`px-3 py-1 rounded-full text-xs font-heading ${yearFilter === String(y.year) ? 'bg-primary-500 text-white' : 'bg-white text-maroon/60'}`}>{y.year}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No Photos" message="Add photos to the gallery." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map(p => (
            <div key={p.id} className="group relative rounded-xl overflow-hidden shadow-md aspect-square">
              <img src={p.image_url} alt={p.caption || p.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <span className="text-cream text-xs font-heading">{p.category}</span>
                <span className="text-cream/60 text-xs">{p.year}</span>
                <button onClick={() => handleDelete(p)} className="p-2 rounded-lg bg-accent-500 text-white hover:bg-accent-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <PhotoForm years={years} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function PhotoForm({ years, onClose, onSaved }: { years: FestivalYear[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', image_url: '', year: years[0]?.year || '', album: '', category: 'Ganesh Idol', caption: '' });
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File): string | null {
    if (!file.type.startsWith('image/')) return 'Please select an image file (JPG, PNG, WebP, etc.)';
    if (file.size > MAX_FILE_SIZE) return `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    return null;
  }

  function handleFileSelect(file: File) {
    setUploadError('');
    setUploadSuccess(false);
    const err = validateFile(file);
    if (err) { setUploadError(err); return; }
    setSelectedFile(file);
    setForm(f => ({ ...f, image_url: '' }));
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function clearFile() {
    setSelectedFile(null);
    setForm(f => ({ ...f, image_url: '' }));
    setUploadError('');
    setUploadSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError('');
    setUploadProgress(10);

    const ext = selectedFile.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;

    setUploadProgress(30);

    const { error } = await supabase.storage.from('gallery-images').upload(fileName, selectedFile, {
      cacheControl: '3600',
      upsert: false,
    });

    setUploadProgress(80);

    if (error) {
      setUploadError(error.message);
      setUploading(false);
      setUploadProgress(0);
      return;
    }

    const { data: urlData } = supabase.storage.from('gallery-images').getPublicUrl(fileName);
    setForm(f => ({ ...f, image_url: urlData.publicUrl }));
    setUploadProgress(100);
    setUploadSuccess(true);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url) {
      setUploadError('Please upload an image or enter an image URL.');
      return;
    }
    setSaving(true);
    const festYear = years.find(y => y.year === parseInt(String(form.year)));
    await supabase.from('photos').insert({
      title: form.title,
      image_url: form.image_url,
      year: form.year ? parseInt(String(form.year)) : null,
      album: form.album,
      category: form.category,
      caption: form.caption,
      festival_year_id: festYear?.id || null,
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-cream border-b border-primary-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-xl text-maroon">Add Photo</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-primary-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Upload Zone */}
          {!selectedFile && !form.image_url && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragOver ? 'border-primary-500 bg-primary-50 scale-[1.02]' : 'border-primary-300 hover:border-primary-400 hover:bg-primary-50/50'
              }`}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-primary-100 flex items-center justify-center mb-3">
                <Upload size={28} className="text-primary-600" />
              </div>
              <p className="font-heading font-semibold text-maroon text-sm">Click to select or drag & drop an image</p>
              <p className="text-maroon/40 text-xs mt-1">JPG, PNG, WebP — up to {MAX_FILE_SIZE / 1024 / 1024}MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="rounded-2xl border border-primary-200 overflow-hidden">
              <div className="relative bg-primary-50">
                <img src={URL.createObjectURL(selectedFile)} alt="Selected preview" className="w-full h-40 object-cover" />
                <button type="button" onClick={clearFile} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                  <X size={16} />
                </button>
              </div>
              <div className="p-3 flex items-center gap-2 bg-white">
                <FileImage size={18} className="text-primary-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading text-maroon truncate">{selectedFile.name}</p>
                  <p className="text-xs text-maroon/40">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                </div>
                {!uploadSuccess && (
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="btn-festival !px-4 !py-2 !text-sm"
                  >
                    {uploading ? 'Uploading...' : <><Upload size={14} /> Upload</>}
                  </button>
                )}
              </div>

              {/* Progress bar */}
              {uploading && (
                <div className="h-2 bg-primary-100">
                  <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}

              {/* Success indicator */}
              {uploadSuccess && (
                <div className="p-3 bg-success-50 flex items-center gap-2 text-success-700 text-sm font-heading">
                  <CheckCircle2 size={18} /> Uploaded successfully!
                </div>
              )}

              {/* Error */}
              {uploadError && (
                <div className="p-3 bg-accent-50 flex items-center gap-2 text-accent-700 text-sm">
                  <AlertCircle size={18} /> {uploadError}
                </div>
              )}
            </div>
          )}

          {/* URL fallback */}
          {!selectedFile && (
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Or paste an image URL</label>
              <input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="input-festival" placeholder="https://..." />
            </div>
          )}

          {/* URL preview (if using URL) */}
          {!selectedFile && form.image_url && (
            <img src={form.image_url} alt="Preview" className="rounded-xl h-32 object-cover" />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Year</label>
              <select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="input-festival">
                {years.map(y => <option key={y.id} value={y.year}>{y.year}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-heading text-maroon/70 block mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-festival">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Album</label>
            <input type="text" value={form.album} onChange={e => setForm({ ...form, album: e.target.value })} className="input-festival" />
          </div>
          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Caption</label>
            <input type="text" value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} className="input-festival" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || !form.image_url} className="btn-festival flex-1">{saving ? 'Saving...' : 'Save Photo'}</button>
            <button type="button" onClick={onClose} className="btn-outline-festival">Cancel</button>
          </div>
          {!form.image_url && selectedFile && !uploadSuccess && (
            <p className="text-xs text-maroon/50 text-center">Upload the selected image before saving.</p>
          )}
        </form>
      </div>
    </div>
  );
}
