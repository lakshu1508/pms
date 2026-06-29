import React, { useState, useEffect } from 'react';

// Use local path routing to communicate directly with your FastAPI server container
const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://127.0.0.1:8000/api'
  : '/api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [metrics, setMetrics] = useState({ completion_rate: 0, critical_count: 0 });
  const [loading, setLoading] = useState(true);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTasks, resEmps, resMetrics] = await Promise.all([
        fetch(`${API_BASE}/tasks`),
        fetch(`${API_BASE}/employees`),
        fetch(`${API_BASE}/metrics`)
      ]);
      
      const tasksData = await resTasks.json();
      const empsData = await resEmps.json();
      const metricsData = await resMetrics.json();

      setTasks(tasksData);
      setEmployees(empsData);
      setMetrics(metricsData);
    } catch (err) {
      console.error("Error loading application state records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.strip) if (!newTitle) return;

    const taskPayload = {
      title: newTitle,
      description: newDesc,
      assigned_to: newAssignee || "Unassigned",
      status: "TODO",
      priority: newPriority,
      due_date: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
    };

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPayload)
      });
      if (res.ok) {
        setNewTitle('');
        setNewDesc('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (taskId, currentStatus) => {
    const statusOrder = ["TODO", "IN_PROGRESS", "DONE"];
    const nextIndex = (statusOrder.indexOf(currentStatus.toUpperCase()) + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];

    try {
      await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', background: '#f8fafc' }}>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading Workspace Dashboard Analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      {/* Header Panel */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '20px 32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: '700' }}>Project Hub Workspace</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Premium Operational Overview & Task Matrix</p>
        </div>
        
        {/* Metrics Blocks */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ background: '#f0fdf4', padding: '12px 20px', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <span style={{ block: 'span', display: 'block', fontSize: '0.8rem', color: '#166534', fontWeight: '600', uppercase: 'true' }}>COMPLETION RATE</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#15803d' }}>{metrics.completion_rate}%</span>
          </div>
          <div style={{ background: '#fef2f2', padding: '12px 20px', borderRadius: '12px', border: '1px solid #fee2e2', textAlign: 'center' }}>
            <span style={{ block: 'span', display: 'block', fontSize: '0.8rem', color: '#991b1b', fontWeight: '600', uppercase: 'true' }}>CRITICAL BLOCKS</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#b91c1c' }}>{metrics.critical_count} Tasks</span>
          </div>
        </div>
      </header>

      {/* Side-by-Side Content Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Controls & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Create Task Panel */}
          <section style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#1e293b' }}>Add New Task Record</h2>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Task Summary Title</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="e.g., Update system configurations" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Detailed Description</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Provide action points..." rows={3} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Assignee</label>
                  <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>
                    <option value="Unassigned">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Priority Tier</label>
                  <select value={newPriority} onChange={e => setNewPriority(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <button type="submit" style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', transition: 'background 0.2s' }}>Create Task</button>
            </form>
          </section>

          {/* Active Employee Directory Grid */}
          <section style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <h2 style={{ margin: '0 0 14px 0', fontSize: '1.2rem', color: '#1e293b' }}>Team Rosters</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {employees.map(emp => (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f8fafc', borderRadius: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{emp.avatar || '👤'}</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>{emp.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>{emp.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Interactive Task Grid Monitor */}
        <main style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', minHeight: '500px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1e293b' }}>Operational Task Matrix</h2>
          
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <p style={{ margin: 0 }}>No task cards registered in the current system state.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tasks.map(task => {
                const isDone = task.status === 'DONE';
                const isHigh = task.priority === 'High';
                
                return (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', background: isDone ? '#f8fafc' : '#ffffff', transition: 'transform 0.15s', opacity: isDone ? 0.75 : 1 }}>
                    <div style={{ flex: 1, paddingRight: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', background: isHigh ? '#fef2f2' : '#f1f5f9', color: isHigh ? '#991b1b' : '#475569' }}>
                          {task.priority}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: isDone ? '#64748b' : '#0f172a', textDecoration: isDone ? 'line-through' : 'none' }}>
                          {task.title}
                        </h3>
                      </div>
                      <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.4' }}>{task.description}</p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8' }}>
                        <span>Assigned: <strong style={{ color: '#475569' }}>{task.assigned_to}</strong></span>
                        <span>Due: <strong style={{ color: '#475569' }}>{task.due_date}</strong></span>
                      </div>
                    </div>

                    {/* Interactive State Toggle Action Button */}
                    <button 
                      onClick={() => handleUpdateStatus(task.id, task.status)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: task.status === 'DONE' ? '#e2e8f0' : task.status === 'IN_PROGRESS' ? '#dbeafe' : '#f1f5f9',
                        borderColor: task.status === 'DONE' ? '#cbd5e1' : task.status === 'IN_PROGRESS' ? '#bfdbfe' : '#e2e8f0',
                        color: task.status === 'DONE' ? '#475569' : task.status === 'IN_PROGRESS' ? '#1e40af' : '#334155'
                      }}
                    >
                      {task.status.replace('_', ' ')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
