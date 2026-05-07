import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { format, isPast } from 'date-fns';

const statusConfig = {
  TODO: { label: 'To Do', color: 'text-slate-400', bg: 'bg-slate-800', dot: 'bg-slate-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-900/30', dot: 'bg-blue-400' },
  DONE: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-900/30', dot: 'bg-emerald-400' }
};

const priorityConfig = {
  LOW: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-800' },
  MEDIUM: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-900/30' },
  HIGH: { label: 'High', color: 'text-red-400', bg: 'bg-red-900/30' }
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

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

  const { totalProjects, myTasks, overdueTasks, tasksByStatus } = data;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Here's what's happening across your projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Projects" value={totalProjects} icon="📁" accent="violet" />
        <StatCard label="My Tasks" value={myTasks.length} icon="📋" accent="blue" />
        <StatCard label="Overdue" value={overdueTasks} icon="⚠️" accent="red" />
        <StatCard label="Completed" value={tasksByStatus.DONE || 0} icon="✅" accent="emerald" />
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(statusConfig).map(([status, cfg]) => (
          <div key={status} className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{tasksByStatus[status] || 0}</p>
            <p className="text-xs text-slate-500 mt-1">tasks</p>
          </div>
        ))}
      </div>

      {/* My tasks */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">My Tasks</h2>
          <span className="text-xs text-slate-500">{myTasks.length} total</span>
        </div>
        {myTasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-500 text-sm">No tasks assigned to you yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {myTasks.map(task => {
              const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';
              const sCfg = statusConfig[task.status];
              const pCfg = priorityConfig[task.priority];
              return (
                <div key={task.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-lg font-medium ${sCfg.bg} ${sCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                        {sCfg.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${pCfg.bg} ${pCfg.color}`}>
                        {pCfg.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                    <Link to={`/projects/${task.project.id}`} className="text-xs text-violet-400 hover:text-violet-300">
                      {task.project.name}
                    </Link>
                  </div>
                  {task.dueDate && (
                    <span className={`text-xs ml-4 shrink-0 px-2 py-1 rounded-lg ${isOverdue ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  const accents = {
    violet: 'text-violet-400',
    blue: 'text-blue-400',
    red: 'text-red-400',
    emerald: 'text-emerald-400'
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${accents[accent]}`}>{value}</p>
    </div>
  );
}
