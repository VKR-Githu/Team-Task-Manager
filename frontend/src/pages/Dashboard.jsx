import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { format, isPast } from 'date-fns';

const statusColors = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700'
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700'
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading dashboard...</div>;

  const { totalProjects, myTasks, overdueTasks, tasksByStatus } = data;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Projects" value={totalProjects} color="blue" />
        <StatCard label="My Tasks" value={myTasks.length} color="purple" />
        <StatCard label="Overdue" value={overdueTasks} color="red" />
        <StatCard label="Completed" value={tasksByStatus.DONE || 0} color="green" />
      </div>

      {/* Task status breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(tasksByStatus).map(([status, count]) => (
          <div key={status} className="bg-white rounded-xl border border-gray-200 p-4">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status]}`}>
              {status.replace('_', ' ')}
            </span>
            <p className="text-3xl font-bold text-gray-900 mt-3">{count}</p>
            <p className="text-sm text-gray-500">tasks</p>
          </div>
        ))}
      </div>

      {/* My tasks */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">My Tasks</h2>
        </div>
        {myTasks.length === 0 ? (
          <p className="p-5 text-gray-500 text-sm">No tasks assigned to you yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {myTasks.map(task => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[task.status]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <Link to={`/projects/${task.project.id}`} className="text-xs text-blue-600 hover:underline">
                    {task.project.name}
                  </Link>
                </div>
                {task.dueDate && (
                  <span className={`text-xs ml-4 ${isPast(new Date(task.dueDate)) && task.status !== 'DONE' ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                    {format(new Date(task.dueDate), 'MMM d')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600'
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color].split(' ')[1]}`}>{value}</p>
    </div>
  );
}
