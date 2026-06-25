import React, { useState } from 'react';

export default function TaskItem({ task, currentRole, moveTask, deleteTask, addComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Priority color tag mapper
  const getPriorityColor = (p) => {
    if (p === 'Critical') return '#ef4444';
    if (p === 'High') return '#f59e0b';
    if (p === 'Medium') return '#3b82f6';
    return '#10b981';
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(task.id, commentText);
    setCommentText('');
  };

  return (
    <div style={{ ...styles.card, borderLeft: `5px solid ${getPriorityColor(task.priority)}` }}>
      <div style={styles.metaRow}>
        <span style={{ ...styles.badge, backgroundColor: getPriorityColor(task.priority) + '22', color: getPriorityColor(task.priority) }}>
          ⚠️ {task.priority}
        </span>
        <span style={styles.dateLabel}>📅 Due: {task.due_date || 'No Limit'}</span>
      </div>

      <h4 style={styles.title}>{task.title}</h4>
      <p style={styles.desc}>{task.description}</p>

      <div style={styles.controlsRow}>
        <div style={styles.navBlock}>
          {task.status !== 'todo' && <button style={styles.arrowBtn} onClick={() => moveTask(task.id, task.status === 'done' ? 'in-progress' : 'todo')}>◀</button>}
          <span style={styles.statusText}>{task.status.toUpperCase()}</span>
          {task.status !== 'done' && <button style={styles.arrowBtn} onClick={() => moveTask(task.id, task.status === 'todo' ? 'in-progress' : 'done')}>▶</button>}
        </div>

        <div style={styles.actionBlock}>
          <button style={styles.commentToggle} onClick={() => setShowComments(!showComments)}>💬 ({task.comments?.length || 0})</button>
          {currentRole === 'admin' && <button style={styles.deleteBtn} onClick={() => deleteTask(task.id)}>🗑️</button>}
        </div>
      </div>

      {showComments && (
        <div style={styles.commentSection}>
          <div style={styles.commentList}>
            {task.comments?.map(c => (
              <div key={c.id} style={styles.commentCard}>
                <div style={styles.cMeta}><strong>{c.author}</strong> <small>{c.timestamp}</small></div>
                <div style={styles.cText}>{c.text}</div>
              </div>
            ))}
          </div>
          <form onSubmit={submitComment} style={styles.commentForm}>
            <input style={styles.cInput} type="text" placeholder="Write an operational status update..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <button style={styles.cSubmit} type="submit">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#111827', borderRadius: '8px', padding: '14px', border: '1px solid #1f2937', minWidth: '220px' },
  metaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  badge: { fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' },
  dateLabel: { fontSize: '11px', color: '#9ca3af' },
  title: { margin: '0 0 6px 0', fontSize: '14px', color: '#f3f4f6' },
  desc: { margin: '0 0 12px 0', fontSize: '12px', color: '#9ca3af', lineHeight: '1.4' },
  controlsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1f2937', paddingTop: '10px' },
  navBlock: { display: 'flex', alignItems: 'center', gap: '6px' },
  arrowBtn: { background: '#1f2937', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' },
  statusText: { fontSize: '10px', fontWeight: 'bold', color: '#6366f1' },
  actionBlock: { display: 'flex', gap: '8px', alignItems: 'center' },
  commentToggle: { background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '12px' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' },
  commentSection: { marginTop: '12px', borderTop: '1px dashed #1f2937', paddingTop: '10px' },
  commentList: { maxZachary: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' },
  commentCard: { backgroundColor: '#1f2937', padding: '6px 8px', borderRadius: '4px' },
  cMeta: { fontSize: '10px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' },
  cText: { fontSize: '11px', color: '#e5e7eb', marginTop: '2px' },
  commentForm: { display: 'flex', gap: '4px' },
  cInput: { flex: 1, background: '#0b0f19', border: '1px solid #1f2937', color: '#fff', fontSize: '11px', padding: '4px 6px', borderRadius: '4px' },
  cSubmit: { background: '#6366f1', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }
};