import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchProjects = () => {
    api.get('/projects').then(res => setProjects(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', form);
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchProjects();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="flex items-center gap-3 text-slate-400">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Loading...
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-slate-300 font-medium">No projects yet</p>
          <p className="text-slate-500 text-sm mt-1">Create your first project to get started</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4 inline-flex">+ New Project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link key={project.id} to={`/projects/${project.id}`}
              className="card p-5 hover:border-slate-700 hover:bg-slate-800/50 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-violet-600/20 border border-violet-600/20 rounded-xl flex items-center justify-center text-violet-400 font-bold text-sm group-hover:bg-violet-600/30 transition-colors">
                  {project.name[0].toUpperCase()}
                </div>
                {project.ownerId === user?.id && (
                  <span className="text-xs bg-violet-900/40 text-violet-400 border border-violet-800/50 px-2 py-0.5 rounded-lg">Owner</span>
                )}
              </div>
              <h3 className="font-semibold text-slate-200 mb-1 group-hover:text-white transition-colors">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{project.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-slate-600 mt-3 pt-3 border-t border-slate-800">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-5">New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Project name</label>
                <input type="text" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input" placeholder="My awesome project" />
              </div>
              <div>
                <label className="label">Description <span className="normal-case text-slate-600">(optional)</span></label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input resize-none" rows={3} placeholder="What's this project about?" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center flex">
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
