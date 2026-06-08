import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image, Archive, File, Download, Upload, Trash2, Plus, X, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProjects, getFiles, uploadFile, deleteFile, getDownloadUrl } from '../services/api';
import toast from 'react-hot-toast';

const fileIcons = {
  document: FileText, image: Image, archive: Archive, other: File,
};
const fileColors = {
  document: 'text-primary-light bg-primary/10', image: 'text-accent bg-accent/10',
  archive: 'text-warning bg-warning/10', other: 'text-text-muted bg-surface-2',
};

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const Deliverables = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ file: null, description: '' });
  const [uploading, setUploading] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (selectedProject) loadFiles(); }, [selectedProject]);
  useEffect(() => {
    if (!searchQ) { setFiltered(files); return; }
    setFiltered(files.filter(f => f.originalName.toLowerCase().includes(searchQ.toLowerCase())));
  }, [searchQ, files]);

  const loadProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0]);
    } finally { setLoading(false); }
  };

  const loadFiles = async () => {
    try {
      const { data } = await getFiles(selectedProject._id);
      setFiles(data);
      setFiltered(data);
    } catch { toast.error('Failed to load files'); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('projectId', selectedProject._id);
      formData.append('description', uploadData.description);
      await uploadFile(formData);
      toast.success('File uploaded!');
      setShowUpload(false);
      setUploadData({ file: null, description: '' });
      loadFiles();
    } catch { toast.error('Failed to upload file'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Delete this file?')) return;
    try {
      await deleteFile(fileId);
      toast.success('File deleted');
      loadFiles();
    } catch { toast.error('Failed to delete file'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Deliverables</h1>
          <p className="text-text-secondary text-sm mt-1">Project files and documents</p>
        </div>
        <div className="flex items-center gap-2">
          {projects.length > 1 && (
            <select className="select-field text-sm w-40" value={selectedProject?._id || ''}
              onChange={e => setSelectedProject(projects.find(p => p._id === e.target.value))}>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
          {isAdmin && (
            <button onClick={() => setShowUpload(true)} className="btn-primary text-sm shrink-0">
              <Upload size={16} /> Upload File
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
          placeholder="Search files..." className="input-field pl-9 max-w-xs"
        />
      </div>

      {/* Files Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((file, i) => {
          const Icon = fileIcons[file.category] || File;
          const colorCls = fileColors[file.category] || fileColors.other;
          return (
            <motion.div
              key={file._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-4 group flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${colorCls}`}>
                  <Icon size={22} />
                </div>
                {file.version > 1 && (
                  <span className="badge badge-gray">v{file.version}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary text-sm leading-snug truncate">{file.originalName}</h3>
                {file.description && (
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{file.description}</p>
                )}
              </div>
              <div className="text-xs text-text-muted space-y-0.5">
                <p>{formatSize(file.size)}</p>
                <p>{new Date(file.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                <p>by {file.uploadedBy?.name}</p>
              </div>
              <div className="flex gap-2 pt-1 border-t border-border/50">
                <a
                  href={getDownloadUrl(file._id)}
                  className="btn-secondary text-xs py-1 flex-1 justify-center flex items-center gap-1"
                  download
                >
                  <Download size={13} /> Download
                </a>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(file._id)}
                    className="btn-danger text-xs py-1 px-2"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 glass-card p-12 text-center">
            <File size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">{searchQ ? 'No files matching search' : 'No files uploaded yet'}</p>
            {isAdmin && !searchQ && (
              <button onClick={() => setShowUpload(true)} className="btn-primary mt-4 mx-auto">
                <Upload size={16} /> Upload First File
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-text-primary">Upload File</h3>
                <button onClick={() => setShowUpload(false)} className="btn-ghost p-1"><X size={18} /></button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="label block mb-1.5">File</label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
                    ${uploadData.file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-border-light'}`}>
                    {uploadData.file ? (
                      <div>
                        <p className="text-sm font-medium text-text-primary">{uploadData.file.name}</p>
                        <p className="text-xs text-text-muted mt-1">{formatSize(uploadData.file.size)}</p>
                        <button type="button" onClick={() => setUploadData(d => ({ ...d, file: null }))}
                          className="btn-ghost text-xs mt-2">Remove</button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload size={24} className="text-text-muted mx-auto mb-2" />
                        <p className="text-sm text-text-secondary">Click to select file</p>
                        <p className="text-xs text-text-muted mt-1">PDF, Images, ZIP, Documents (max 50MB)</p>
                        <input type="file" className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.zip,.doc,.docx,.txt,.xls,.xlsx"
                          onChange={e => setUploadData(d => ({ ...d, file: e.target.files[0] }))} />
                      </label>
                    )}
                  </div>
                </div>
                <div>
                  <label className="label block mb-1.5">Description (optional)</label>
                  <input type="text" value={uploadData.description} onChange={e => setUploadData(d => ({ ...d, description: e.target.value }))}
                    className="input-field" placeholder="Brief file description..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowUpload(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={uploading || !uploadData.file} className="btn-primary flex-1 justify-center">
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Deliverables;
