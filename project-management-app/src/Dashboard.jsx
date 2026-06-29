import React, { useState } from 'react';

export default function Dashboard({ tasks, employees, metrics, onAddTask, onUpdateStatus }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('Unassigned');
  const [priority, setPriority] = useState('Medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title,
      description,
      assigned_to: assignee,
      priority,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    setTitle('');
    setDescription('');
    setAssignee('Unassigned');
    setPriority('Medium');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif', padding: '24px', boxSizing: 'border-box' }}>
      
      {/* Premium Dashboard Metrics Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '20px 32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: '700' }}>Project Management Studio</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Modular Side-By-Side Visual Controller</p>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ background: '#f0fdf4', padding: '12px 20px', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center', minWidth: '130px' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#166534', fontWeight: '700', letterSpacing: '0.05em' }}>COMPLETION RATE</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#15803d' }}>{metrics.completion_rate}%</span>
          </div>
          <div style={{ background: '#fef2f2', padding: '12px 20px', borderRadius: '12px', border: '1px solid #fee2e2', textAlign: 'center', minWidth: '130px' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#991b1b', fontWeight: '700', letterSpacing: '0.05em' }}>CRITICAL BLOCKS</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#b91c1c' }}>{metrics.critical_count} Tasks</span>
          </div>
        </div>
      </header>

      {/* Side-by-Side Functional Grid System */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side Action Control Board */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Add Task Registry Form Card */}
          <section style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <h2 style={{ margin: '0 0 18px 0', fontSize: '1.2rem', color: '#1e293b', fontWeight: '600' }}>Register New Task</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Task Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Required objective summary..." style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Context Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide action tracking details..." rows={3} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Assignee</label>
                  <select value={assignee} onChange={e => setAssignee(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.9rem' }}>
                    <option value="Unassigned">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Priority Tier</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.9rem' }}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <button type="submit" style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>Deploy Task Card</button>
            </form>
          </section>

          {/* Connected Team Directory List */}
          <section style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <h2 style={{ margin: '0 0 14px 0', fontSize: '1.2rem', color: '#1e293b', fontWeight: '600' }}>Personnel Roster</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {employees.map(emp => (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '1.4rem' }}>{emp.avatar || '👤'}</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: '600' }}>{emp.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>{emp.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Side Task Monitoring Panel */}
        <main style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', minHeight: '520px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', color: '#1e293b', fontWeight: '600' }}>Active Task Stream</h2>
          
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
              <p style={{ margin: 0, fontSize: '1rem' }}>No task cards registered in system state clusters.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {tasks.map(task => {
                const cleanStatus = String(task.status).toUpperCase().replace('-', '_');
                const isDone = cleanStatus === 'DONE';
                const isHigh = task.priority === 'High';
                
                return (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', background: isDone ? '#f8fafc' : '#ffffff', opacity: isDone ? 0.75 : 1 }}>
                    <div style={{ flex: 1, paddingRight: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', background: isHigh ? '#fef2f2' : '#f1f5f9', color: isHigh ? '#991b1b' : '#475569' }}>
                          {task.priority}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: isDone ? '#64748b' : '#0f172a', textDecoration: isDone ? 'line-through' : 'none', fontWeight: '600' }}>
                          {task.title}
                        </h3>
                      </div>
                      <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.4' }}>{task.description}</p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8' }}>
                        <span>Operator: <strong style={{ color: '#475569' }}>{task.assigned_to}</strong></span>
                        <span>Target Due: <strong style={{ color: '#475569' }}>{task.due_date}</strong></span>
                      </div>
                    </div>

                    {/* Interactive State Mutation Badge Toggle */}
                    <button 
                      onClick={() => onUpdateStatus(task.id, cleanStatus)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        background: isDone ? '#e2e8f0' : cleanStatus === 'IN_PROGRESS' ? '#dbeafe' : '#f1f5f9',
                        borderColor: isDone ? '#cbd5e1' : cleanStatus === 'IN_PROGRESS' ? '#bfdbfe' : '#e2e8f0',
                        color: isDone ? '#475569' : cleanStatus === 'IN_PROGRESS' ? '#1e40af' : '#334155'
                      }}
                    >
                      {cleanStatus.replace('_', ' ')}
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

