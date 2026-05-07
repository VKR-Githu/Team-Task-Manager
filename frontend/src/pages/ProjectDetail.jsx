import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';

const statusConfig = {
  TODO: { label: 'To Do', color: 'text-slate-400', bg: 'bg-slate-800/60', border: 'border-slate-700', dot: 'bg-slate-500', header: 'bg-slate-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-950/30', border: 'border-blue-900/50', dot: 'bg-blue-400', header: 'bg-blue-950/50' },
  DONE: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-950/30', border: 'border-emerald-900/50', dot: 'bg-emerald-400', header: 'bg-emerald-950/50' }
};

const priorityConfig = {
  LOW: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-800' },
  MEDIUM: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-900/30' },
  HIGH: { label: 'High', color: 'text-red-400', bg: 'bg-red-900/30' }
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigneeId: '', priority: 'MEDIUM', dueDate: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');
  const [error, setError] = useState('');

  const fetchProject = () => {
    api.get(`/projects/${id}`).then(res => setProject(res.data)).catch(() => navigate('/projects')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProject(); }, [id]);

  const myRole = project?.members.find(m => m.userId === user?.id)?.role;
  const isAdmin = myRole === 'ADMIN';

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...taskForm, projectId: id, assigneeId: taskForm.assigneeId || undefined };
      if (editTask) await api.put(`/tasks/${editTask.id}`, payload);
      else await api.post('/tasks', payload);
      closeTaskModal();
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task');
    }
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditTask(null);
    setError('');
    setTaskForm({ title: '', description: '', assigneeId: '', priority: 'MEDIUM', dueDate: '' });
  };

  const handleStatusChange = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    fetchProject();
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    fetchProject();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole });
      setShowMemberModal(false);
      setMemberEmail('');
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    await api.delete(`/projects/${id}/members/${userId}`);
    fetchProject();
  };

  const openEditTask = (task) => {
    setEditTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      assigneeId: task.assigneeId || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setShowTaskModal(true);
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    await api.delete(`/projects/${id}`);
    navigate('/projects');
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
  if (!project) return null;

  const tasksByStatus = {
    TODO: project.tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: project.tasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE: project.tasks.filter(t => t.status === 'DONE')
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => navigate('/projects')} className="text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${isAdmin ? 'bg-violet-900/40 text-violet-400 border border-violet-800/50' : 'bg-slate-800 text-slate-400'}`}>
              {myRole}
            </span>
          </div>
          {project.description && <p className="text-slate-400 text-sm ml-7">{project.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowTaskModal(true)} className="btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
            <button onClick={() => setShowMemberModal(true)} className="btn-secondary">+ Member</button>
            <button onClick={handleDeleteProject} className="btn-danger">Delete</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-800">
        {['tasks', 'members'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-all -mb-px ${
              activeTab === tab ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>
            {tab} ({tab === 'tasks' ? project.tasks.length : project.members.length})
          </button>
        ))}
      </div>

      {/* Kanban */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(tasksByStatus).map(([status, tasks]) => {
            const cfg = statusConfig[status];
            return (
              <div key={status} className={`rounded-2xl border ${cfg.border} overflow-hidden`}>
                <div className={`px-4 py-3 ${cfg.header} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded-full">{tasks.length}</span>
                </div>
                <div className={`p-3 space-y-2 min-h-32 ${cfg.bg}`}>
                  {tasks.map(task => {
                    const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';
                    const pCfg = priorityConfig[task.priority];
                    return (
                      <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition-all">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-slate-200 flex-1 leading-snug">{task.title}</p>
                          {isAdmin && (
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => openEditTask(task)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-900/30 transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button onClick={() => handleDeleteTask(task.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/30 transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${pCfg.bg} ${pCfg.color}`}>{pCfg.label}</span>
                          {task.assignee && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                              {task.assignee.name}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-md ${isOverdue ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                              {format(new Date(task.dueDate), 'MMM d')}
                            </span>
                          )}
                        </div>
                        <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                          className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer">
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </div>
                    );
                  })}
                  {tasks.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-slate-600">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Members */}
      {activeTab === 'members' && (
        <div className="card divide-y divide-slate-800">
          {project.members.map(member => (
            <div key={member.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-600/20 border border-violet-600/20 rounded-full flex items-center justify-center text-violet-400 text-sm font-bold">
                  {member.user.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{member.user.name}</p>
                  <p className="text-xs text-slate-500">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${
                  member.role === 'ADMIN'
                    ? 'bg-violet-900/40 text-violet-400 border-violet-800/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {member.role}
                </span>
                {isAdmin && member.userId !== user?.id && (
                  <button onClick={() => handleRemoveMember(member.userId)}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-900/20">
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-5">{editTask ? 'Edit Task' : 'New Task'}</h2>
            {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input type="text" required value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="input" placeholder="Task title" />
              </div>
              <div>
                <label className="label">Description <span className="normal-case text-slate-600">(optional)</span></label>
                <textarea value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="input resize-none" rows={2} placeholder="Add details..." />
              </div>
              <div>
                <label className="label">Assign to</label>
                <select value={taskForm.assigneeId}
                  onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                  className="input">
                  <option value="">Unassigned</option>
                  {project.members.map(m => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Priority</label>
                  <select value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="input">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="label">Due date</label>
                  <input type="date" value={taskForm.dueDate}
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="input" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeTaskModal} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center flex">
                  {editTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="card p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-white mb-5">Add Member</h2>
            {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input type="email" required value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  className="input" placeholder="member@example.com" />
              </div>
              <div>
                <label className="label">Role</label>
                <select value={memberRole} onChange={e => setMemberRole(e.target.value)} className="input">
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowMemberModal(false); setError(''); }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center flex">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
