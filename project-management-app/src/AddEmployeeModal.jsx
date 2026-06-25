import React, { useState } from 'react';

export default function AddEmployeeModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [customId, setCustomId] = useState('');
  const [avatar, setAvatar] = useState('👨‍💻');

  const avatarOptions = ['👨‍💻', '👩‍💻', '👩‍🔬', '👨‍🎨', '👩‍💼', '🤖', '🦊', '🚀'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !customId.trim()) return;
    onSave(name, customId, avatar);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.modalTitle}>👤 Onboard New Employee</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          
          <input 
            type="text" 
            placeholder="Full Name (e.g., Jane Doe)" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            style={styles.input}
            required 
          />

          <input 
            type="text" 
            placeholder="Employee ID (e.g., EMP-104)" 
            value={customId} 
            onChange={e => setCustomId(e.target.value)} 
            style={styles.input}
            required 
          />
          
          {/* 🎭 Avatar Badge Selector */}
          <div style={styles.selectGroup}>
            <label style={styles.label}>Select Profile Avatar:</label>
            <div style={styles.avatarGrid}>
              {avatarOptions.map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setAvatar(opt)}
                  style={{
                    ...styles.avatarBtn,
                    backgroundColor: avatar === opt ? '#6366f1' : '#1f2937',
                    border: avatar === opt ? '1px solid #6366f1' : '1px solid #374151'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.formActions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" style={styles.submitBtn}>Add to System</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '380px' },
  modalTitle: { margin: '0 0 18px 0', fontSize: '18px', fontWeight: '600' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  input: { padding: '12px', borderRadius: '8px', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f3f4f6', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none' },
  selectGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', color: '#9ca3af', fontWeight: '500' },
  avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
  avatarBtn: { fontSize: '20px', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' },
  cancelBtn: { padding: '10px 16px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' },
  submitBtn: { padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }
};