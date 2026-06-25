import React, { useState } from 'react';

export default function AddTaskModal({ employees, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [emp, setEmp] = useState(employees[0]?.id || '');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('Medium');
  const [date, setDate] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !emp) return;
    onSave(title, desc, emp, status, priority, date || "No Limit");
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={{ margin: '0 0 16px 0' }}>⚡ Deploy Operational Directive</h3>
        <form onSubmit={submit} style={styles.form}>
          <input style={styles.input} type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <textarea style={styles.input} placeholder="Task Operational Description..." value={desc} onChange={e => setDesc(e.target.value)} />
          
          <label style={styles.label}>Assign Responsibility Context:</label>
          <select style={styles.input} value={emp} onChange={e => setEmp(e.target.value)}>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={styles.label}>Initial Pipeline Lane:</label>
              <select style={styles.input} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="todo">Backlog</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Severity/Priority:</label>
              <select style={styles.input} value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <label style={styles.label}>Target Timeline Commitment (Due Date):</label>
          <input style={styles.input} type="date" value={date} onChange={e => setDate(e.target.value)} />

          <div style={styles.actions}>
            <button type="button" style={styles.cancel} onClick={onClose}>Abort</button>
            <button type="submit" style={styles.save}>Publish</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '12px', width: '400px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontSize: '11px', color: '#9ca3af', marginBottom: '-6px', fontWeight: 'bold' },
  input: { backgroundColor: '#0b0f19', border: '1px solid #1f2937', color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '13px', width: '100%', boxSizing: 'border-box' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
  cancel: { padding: '8px 16px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' },
  save: { padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
};