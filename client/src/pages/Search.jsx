import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, FileText, CheckSquare, AlertCircle } from 'lucide-react';
import { search } from '../services/api';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tasks: [], issues: [], files: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults({ tasks: [], issues: [], files: [] }); return; }
    const timer = setTimeout(() => doSearch(), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const doSearch = async () => {
    setLoading(true);
    try {
      const { data } = await search({ q: query });
      setResults(data);
    } finally { setLoading(false); }
  };

  const total = (results.tasks?.length || 0) + (results.issues?.length || 0) + (results.files?.length || 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Search</h1>
        <p className="text-text-secondary text-sm mt-1">Search across tasks, issues, and files</p>
      </div>

      <div className="relative">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)} autoFocus
          className="input-field pl-11 py-3 text-base"
          placeholder="Search tasks, files, issues..."
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        )}
      </div>

      {query && (
        <p className="text-sm text-text-muted">{total} result{total !== 1 ? 's' : ''} for "{query}"</p>
      )}

      {results.tasks?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare size={16} className="text-primary-light" />
            <h2 className="font-semibold text-text-secondary text-sm">Tasks</h2>
            <span className="badge badge-gray">{results.tasks.length}</span>
          </div>
          <div className="space-y-2">
            {results.tasks.map((t, i) => (
              <motion.div key={t._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="glass-card p-3 flex items-center justify-between gap-3">
                <p className="text-sm text-text-primary">{t.title}</p>
                <span className={`badge ${t.status === 'completed' ? 'badge-success' : t.status === 'in-progress' ? 'badge-warning' : 'badge-gray'}`}>{t.status}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {results.issues?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-danger" />
            <h2 className="font-semibold text-text-secondary text-sm">Issues</h2>
            <span className="badge badge-gray">{results.issues.length}</span>
          </div>
          <div className="space-y-2">
            {results.issues.map((issue, i) => (
              <motion.div key={issue._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="glass-card p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-text-primary">{issue.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">by {issue.reportedBy?.name}</p>
                </div>
                <span className={`badge ${issue.priority === 'high' ? 'badge-danger' : issue.priority === 'medium' ? 'badge-warning' : 'badge-gray'}`}>{issue.priority}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {results.files?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-accent" />
            <h2 className="font-semibold text-text-secondary text-sm">Files</h2>
            <span className="badge badge-gray">{results.files.length}</span>
          </div>
          <div className="space-y-2">
            {results.files.map((f, i) => (
              <motion.div key={f._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="glass-card p-3 flex items-center justify-between gap-3">
                <p className="text-sm text-text-primary">{f.originalName}</p>
                <span className="badge badge-accent">{f.category}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {query && !loading && total === 0 && (
        <div className="glass-card p-12 text-center">
          <SearchIcon size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No results found for "{query}"</p>
        </div>
      )}

      {!query && (
        <div className="glass-card p-12 text-center">
          <SearchIcon size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">Start typing to search</p>
          <p className="text-text-muted text-sm mt-1">Search across tasks, issues, and files</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
