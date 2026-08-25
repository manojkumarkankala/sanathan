import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, X, Video as VideoIcon, Upload, CheckCircle2, FileVideo, AlertCircle, Link2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { getYouTubeThumb } from '@/lib/utils';
import type { Video, FestivalYear } from '@/lib/types';

const CATEGORIES = ['Festival Videos', 'Puja Videos', 'Cultural Programs', 'Dance', 'Music', 'Procession', 'Youth Activities', 'Special Moments', 'Interviews', 'Short Videos', 'Previous Years'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [years, setYears] = useState<FestivalYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: v }, { data: y }] = await Promise.all([
      supabase.from('videos').select('*').order('created_at', { ascending: false }),
      supabase.from('festival_years').select('*').order('year', { ascending: false }),
    ]);
    if (v) setVideos(v);
    if (y) setYears(y);
    setLoading(false);
  }

  async function handleDelete(vid: Video) {
    if (!confirm('Delete this video?')) return;
    await supabase.from('videos').delete().eq('id', vid.id);
    load();
  }

  if (loading) return <LoadingSpinner label="Loading videos..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Videos Management</h1>
          <p className="text-maroon/50 text-sm mt-1">{videos.length} videos total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-festival"><Plus size={18} /> Add Video</button>
      </div>

      {videos.length === 0 ? (
        <EmptyState icon={VideoIcon} title="No Videos" message="Add videos to the gallery." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(v => (
            <div key={v.id} className="card-festival overflow-hidden">
              <div className="relative h-32">
                <img src={v.thumbnail_url || getYouTubeThumb(v.video_url)} alt={v.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-heading font-semibold text-sm text-maroon line-clamp-1">{v.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-maroon/40">{v.category} • {v.year}</span>
                  <button onClick={() => handleDelete(v)} className="p-1.5 rounded-lg bg-accent-50 text-accent-600 hover:bg-accent-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <VideoForm years={years} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function VideoForm({ years, onClose, onSaved }: { years: FestivalYear[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', video_url: '', thumbnail_url: '', year: years[0]?.year || '', category: 'Festival Videos', description: '' });
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File): string | null {
    if (!file.type.startsWith('video/')) return 'Please select a video file (MP4, WebM, MOV, etc.)';
    if (file.size > MAX_FILE_SIZE) return `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    return null;
  }

  function handleFileSelect(file: File) {
    setUploadError('');
    setUploadSuccess(false);
    const err = validateFile(file);
    if (err) { setUploadError(err); return; }
    setSelectedFile(file);
    setForm(f => ({ ...f, video_url: '' }));
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
    setForm(f => ({ ...f, video_url: '' }));
    setUploadError('');
    setUploadSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function switchMode(m: 'upload' | 'url') {
    setMode(m);
    clearFile();
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError('');
    setUploadProgress(10);

    const ext = selectedFile.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;

    setUploadProgress(30);

    const { error } = await supabase.storage.from('videos').upload(fileName, selectedFile, {
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

    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(fileName);
    setForm(f => ({ ...f, video_url: urlData.publicUrl }));
    setUploadProgress(100);
    setUploadSuccess(true);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.video_url) {
      setUploadError(mode === 'upload' ? 'Please upload a video file first.' : 'Please enter a video URL.');
      return;
    }
    setSaving(true);
    const festYear = years.find(y => y.year === parseInt(String(form.year)));
    const thumb = form.thumbnail_url || getYouTubeThumb(form.video_url);
    await supabase.from('videos').insert({
      title: form.title,
      video_url: form.video_url,
      thumbnail_url: thumb,
      year: form.year ? parseInt(String(form.year)) : null,
      category: form.category,
      description: form.description,
      festival_year_id: festYear?.id || null,
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-cream border-b border-primary-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-xl text-maroon">Add Video</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-primary-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div>
            <label className="text-sm font-heading text-maroon/70 block mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-festival" />
          </div>

          {/* Mode tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-primary-50">
            <button
              type="button"
              onClick={() => switchMode('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-heading font-semibold transition-all ${
                mode === 'upload' ? 'bg-primary-500 text-white shadow-md' : 'text-maroon/60 hover:bg-primary-100'
              }`}
            >
              <Upload size={16} /> Upload File
            </button>
            <button
              type="button"
              onClick={() => switchMode('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-heading font-semibold transition-all ${
                mode === 'url' ? 'bg-primary-500 text-white shadow-md' : 'text-maroon/60 hover:bg-primary-100'
              }`}
            >
              <Link2 size={16} /> Paste URL
            </button>
          </div>

          {/* Upload mode */}
          {mode === 'upload' && (
            <>
              {!selectedFile && !form.video_url && (
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
                  <p className="font-heading font-semibold text-maroon text-sm">Click to select or drag & drop a video</p>
                  <p className="text-maroon/40 text-xs mt-1">MP4, WebM, MOV — up to {MAX_FILE_SIZE / 1024 / 1024}MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              )}

              {selectedFile && (
                <div className="rounded-2xl border border-primary-200 overflow-hidden">
                  <div className="relative bg-maroon h-32 flex items-center justify-center">
                    <FileVideo size={40} className="text-cream/60" />
                    <button type="button" onClick={clearFile} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="p-3 flex items-center gap-2 bg-white">
                    <FileVideo size={18} className="text-primary-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading text-maroon truncate">{selectedFile.name}</p>
                      <p className="text-xs text-maroon/40">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
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

                  {uploadSuccess && (
                    <div className="p-3 bg-success-50 flex items-center gap-2 text-success-700 text-sm font-heading">
                      <CheckCircle2 size={18} /> Uploaded successfully!
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3 bg-accent-50 flex items-center gap-2 text-accent-700 text-sm">
                      <AlertCircle size={18} /> {uploadError}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* URL mode */}
          {mode === 'url' && (
            <>
              <div>
                <label className="text-sm font-heading text-maroon/70 block mb-1">Video URL (YouTube or direct link) *</label>
                <input type="url" required value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} className="input-festival" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="text-sm font-heading text-maroon/70 block mb-1">Thumbnail URL (auto for YouTube)</label>
                <input type="url" value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} className="input-festival" placeholder="Auto-generated for YouTube" />
              </div>
              {form.thumbnail_url && <img src={form.thumbnail_url} alt="Thumbnail preview" className="rounded-xl h-24 object-cover" />}
            </>
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
            <label className="text-sm font-heading text-maroon/70 block mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-festival resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || !form.video_url} className="btn-festival flex-1">{saving ? 'Saving...' : 'Save Video'}</button>
            <button type="button" onClick={onClose} className="btn-outline-festival">Cancel</button>
          </div>
          {!form.video_url && mode === 'upload' && selectedFile && !uploadSuccess && (
            <p className="text-xs text-maroon/50 text-center">Upload the selected video before saving.</p>
          )}
        </form>
      </div>
    </div>
  );
}
