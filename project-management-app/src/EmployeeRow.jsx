import React, { useState } from 'react';

export default function EmployeeRow({ employee, tasks, currentRole, moveTask, deleteTask, addComment, onDelete }) {
  const [commentTexts, setCommentTexts] = useState({});

  const handleStatusCycle = (taskId, currentStatus) => {
    let nextStatus = "TODO";
    if (currentStatus === "TODO") nextStatus = "IN_PROGRESS";
    else if (currentStatus === "IN_PROGRESS") nextStatus = "DONE";
    else if (currentStatus === "DONE") nextStatus = "TODO"; // loops back round

    // Trigger update handler
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
    <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
      
      {/* Employee Info Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #1f2937', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={employee.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="avatar" style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#f3f4f6' }}>{employee.name}</h3>
            <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '600' }}>ID Code: {employee.id}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>Active Assignments: <strong>{tasks.length}</strong></span>
          {currentRole === 'admin' && onDelete && (
            <button onClick={onDelete} style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>🗑️ Offboard</button>
          )}
        </div>
      </div>

      {/* Embedded Task List Grid View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
        {tasks.map(task => {
          const normStatus = str(task.status).upper();
          return (
            <div key={task.id} style={{ backgroundColor: '#1f2937', borderRadius: '8px', padding: '16px', borderLeft: normStatus === 'DONE' ? '4px solid #10b981' : '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#374151', padding: '2px 6px', borderRadius: '4px', color: '#f59e0b' }}>⚠️ {task.priority}</span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>📅 {task.due_date}</span>
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#fff' }}>{task.title}</h4>
              <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#9ca3af', lineHeight: '1.4' }}>{task.description}</p>
              
              {/* Interactive Status Bar Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111827', padding: '8px 12px', borderRadius: '6px', marginBottom: '15px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: normStatus === 'DONE' ? '#10b981' : '#38bdf8' }}>
                  {normStatus}
                </span>
                <button 
                  onClick={() => handleStatusCycle(task.id, normStatus)}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px' }}
                  title="Cycle Task Status"
                >
                  ▶️ Change
                </button>
              </div>

              {/* Comments Read Feed Block */}
              <div style={{ borderTop: '1px solid #374151', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>💬 Discussion Thread ({task.comments?.length || 0}):</span>
                <div style={{ maxHeight: '80px', overflowY: 'auto', margin: '5px 0' }}>
                  {task.comments?.map((c, idx) => (
                    <div key={idx} style={{ fontSize: '12px', marginBottom: '4px', color: '#d1d5db' }}>
                      <strong style={{ color: '#fff' }}>{c.author}:</strong> {c.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={(e) => handleCommentSubmit(e, task.id)} style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Write a message..." 
                    value={commentTexts[task.id] || ''} 
                    onChange={(e) => setCommentTexts({ ...commentTexts, [task.id]: e.target.value })}
                    style={{ flexGrow: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '4px', padding: '6px', color: '#fff', fontSize: '12px' }}
                  />
                  <button type="submit" style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 10px', fontSize: '12px', cursor: 'pointer' }}>Send</button>
                </form>
              </div>

              {currentRole === 'admin' && (
                <button onClick={() => deleteTask(task.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', marginTop: '10px', padding: 0 }}>❌ Remove Task</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple Helper injection for safety styling fallback properties
function str(val) {
  return {
    upper: () => String(val || '').toUpperCase().trim()
  };
}
