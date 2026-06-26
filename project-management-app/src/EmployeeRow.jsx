import React, { useState } from 'react';

export default function EmployeeRow({ employee, tasks, currentRole, moveTask, deleteTask, addComment, onDelete }) {
  const [commentTexts, setCommentTexts] = useState({});

  const handleStatusCycle = (taskId, currentStatus) => {
    let nextStatus = "TODO";
    if (currentStatus === "TODO") nextStatus = "IN_PROGRESS";
    else if (currentStatus === "IN_PROGRESS") nextStatus = "DONE";
    else if (currentStatus === "DONE") nextStatus = "TODO";
    moveTask(taskId, nextStatus);
  };

  const handleCommentSubmit = (e, taskId) => {
    e.preventDefault();
    const txt = commentTexts[taskId];
    if (!txt || !txt.trim()) return;
    
    addComment(taskId, txt.trim());
    setCommentTexts({ ...commentTexts, [taskId]: '' });
  };

  return (
    // 🖥️ Main split layout: Profile on Left (1 part), Tasks on Right (2.5 parts)
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 2.5fr', 
      gap: '24px', 
      backgroundColor: '#111827', 
      border: '1px solid #1f2937', 
      borderRadius: '16px', 
      padding: '24px', 
      marginBottom: '24px',
      alignItems: 'start'
    }}>
      
      {/* 👤 LEFT PANEL: EMPLOYEE PROFILE CARD */}
      <div style={{ 
        backgroundColor: '#1f2937', 
        padding: '24px', 
        borderRadius: '12px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        border: '1px solid #374151'
      }}>
        <img 
          src={employee.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
          alt="avatar" 
          style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '12px', backgroundColor: '#111827' }} 
        />
        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#fff' }}>{employee.name}</h3>
        <span style={{ backgroundColor: '#2563eb', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
          {employee.id}
        </span>
        
        <div style={{ width: '100%', borderTop: '1px solid #374151', paddingTop: '12px', marginTop: '4px', fontSize: '13px', color: '#9ca3af' }}>
          Workload: <strong style={{ color: '#fff' }}>{tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}</strong>
        </div>

        {currentRole === 'admin' && onDelete && (
          <button 
            onClick={onDelete} 
            style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginTop: '16px', transition: '0.2s' }}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            🗑️ Offboard Employee
          </button>
        )}
      </div>

      {/* 📋 RIGHT PANEL: ASSIGNED TASKS GRID */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tasks.length === 0 ? (
          <div style={{ backgroundColor: '#1f2937', border: '1px dashed #374151', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
            No tasks currently assigned to this team member.
          </div>
        ) : (
          tasks.map(task => {
            const normStatus = String(task.status || '').toUpperCase().trim() || 'TODO';
            const isDone = normStatus === 'DONE';

            return (
              <div 
                key={task.id} 
                style={{ 
                  backgroundColor: '#1f2937', 
                  borderRadius: '12px', 
                  padding: '20px', 
                  borderLeft: isDone ? '4px solid #10b981' : '4px solid #3b82f6',
                  border: '1px solid #374151',
                  borderLeftWidth: '5px'
                }}
              >
                {/* Task Header Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    backgroundColor: task.priority === 'High' ? '#7f1d1d' : '#374151', 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    color: task.priority === 'High' ? '#fca5a5' : '#f59e0b' 
                  }}>
                    ⚠️ {task.priority} Priority
                  </span>
                  <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📅 Due: {task.due_date}
                  </span>
                </div>

                {/* Content Title & Details */}
                <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#fff', fontWeight: '600' }}>{task.title}</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' }}>{task.description}</p>
                
                {/* Bottom Controlled Action Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111827', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: isDone ? '#10b981' : '#38bdf8', letterSpacing: '0.5px' }}>
                    📋 STATUS: {normStatus}
                  </span>
                  <button 
                    onClick={() => handleStatusCycle(task.id, normStatus)}
                    style={{ backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    ▶️ Change
                  </button>
                </div>

                {/* Comments Forum Thread */}
                <div style={{ borderTop: '1px solid #374151', paddingTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                    💬 Team Discussion ({task.comments?.length || 0}):
                  </span>
                  <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {task.comments?.map((c, idx) => (
                      <div key={idx} style={{ fontSize: '12px', color: '#d1d5db', backgroundColor: '#111827', padding: '6px 10px', borderRadius: '6px' }}>
                        <strong style={{ color: '#6366f1' }}>{c.author}</strong> <span style={{ color: '#4b5563', fontSize: '10px' }}>• {c.timestamp || ''}</span>
                        <div style={{ marginTop: '2px' }}>{c.text}</div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={(e) => handleCommentSubmit(e, task.id)} style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Type a group message update..." 
                      value={commentTexts[task.id] || ''} 
                      onChange={(e) => setCommentTexts({ ...commentTexts, [task.id]: e.target.value })}
                      style={{ flexGrow: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                    <button type="submit" style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Send</button>
                  </form>
                </div>

                {currentRole === 'admin' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button onClick={() => deleteTask(task.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', padding: 0 }}>❌ Remove Task Assignment</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
