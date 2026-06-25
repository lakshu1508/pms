import React, { useState, useEffect } from 'react';
import EmployeeRow from './EmployeeRow';
import AddTaskModal from './AddTaskModal';
import AddEmployeeModal from './AddEmployeeModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const [currentRole, setCurrentRole] = useState('employee');
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState({ completion_rate: 0, critical_count: 0 });
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

  const fetchAllData = async () => {
    try {
      fetch(`${API_BASE_URL}/tasks`).then(res => res.json()).then(setTasks);
      fetch(`${API_BASE_URL}/metrics`).then(res => res.json()).then(setMetrics);
      fetch(`${API_BASE_URL}/employees`).then(res => res.json()).then(setEmployees);
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleRoleChange = (targetRole) => {
    if (targetRole === 'admin') {
      const pinInput = prompt('🛡️ Enter Admin Passkey PIN:');
      if (pinInput === '1234') { setCurrentRole('admin'); alert('✅ Access Granted.'); }
      else if (pinInput !== null) alert('❌ Access Denied!');
    } else { setCurrentRole('employee'); }
  };

  const moveTask = async (taskId, newStatus) => {
    await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchAllData();
  };

  const addTask = async (title, description, assignedTo, status, priority, due_date) => {
    await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, assignedTo, status, priority, due_date })
    });
    setIsTaskModalOpen(false);
    fetchAllData();
  };

  const deleteTask = async (taskId) => {
    await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
    fetchAllData();
  };

  const addComment = async (taskId, text) => {
    const author = currentRole === 'admin' ? "👑 Administrator" : "🛠️ Team Member";
    await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text })
    });
    fetchAllData();
  };

  const addEmployee = async (name, customId, avatar) => {
    const formattedId = customId.toUpperCase().trim();
    await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: formattedId, name, avatar })
    });
    setIsEmpModalOpen(false);
    fetchAllData();
  };

  const deleteEmployee = async (employeeId) => {
    await fetch(`${API_BASE_URL}/employees/${employeeId}`, { method: 'DELETE' });
    fetchAllData();
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.roleBar}>
        <span style={styles.roleLabel}>🔑 Clearance Scope:</span>
        <button style={{ ...styles.roleTab, backgroundColor: currentRole === 'admin' ? '#6366f1' : '#1f2937' }} onClick={() => handleRoleChange('admin')}>👑 Admin Mode</button>
        <button style={{ ...styles.roleTab, backgroundColor: currentRole === 'employee' ? '#10b981' : '#1f2937' }} onClick={() => handleRoleChange('employee')}>🛠️ Employee Mode</button>
      </div>

      <div style={styles.metricsBar}>
        <div style={styles.metricCard}>💻 Velocity: <strong>{metrics.completion_rate}% Done</strong></div>
        <div style={{...styles.metricCard, color: metrics.critical_count > 0 ? '#ef4444' : '#f3f4f6'}}>🚨 Critical Actions: <strong>{metrics.critical_count} Open</strong></div>
      </div>

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Project Management Portal</h1>
          <p style={styles.subtitle}>System scope mapped as: <strong>{currentRole.toUpperCase()}</strong></p>
        </div>
        {currentRole === 'admin' && (
          <div style={styles.btnGroup}>
            <button style={styles.secondaryButton} onClick={() => setIsEmpModalOpen(true)}>👤 Onboard Employee</button>
            <button style={styles.addButton} onClick={() => setIsTaskModalOpen(true)}>⚡ Assign Priority Task</button>
          </div>
        )}
      </header>

      <div style={styles.listContainer}>
        {employees.map(emp => (
          <EmployeeRow 
            key={emp.id} 
            employee={emp} 
            currentRole={currentRole}
            tasks={tasks.filter(t => t.assignedTo === emp.id)}
            moveTask={moveTask} 
            deleteTask={deleteTask} 
            addComment={addComment}
            onDelete={() => deleteEmployee(emp.id)}
          />
        ))}
      </div>

      {isTaskModalOpen && <AddTaskModal employees={employees} onSave={addTask} onClose={() => setIsTaskModalOpen(false)} />}
      {isEmpModalOpen && <AddEmployeeModal onSave={addEmployee} onClose={() => setIsEmpModalOpen(false)} />}
    </div>
  );
}

const styles = {
  dashboardContainer: { padding: '40px', fontFamily: '"Inter", sans-serif', backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh' },
  roleBar: { display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#111827', padding: '12px 20px', borderRadius: '8px', border: '1px solid #1f2937', marginBottom: '15px' },
  roleLabel: { fontSize: '13px', color: '#9ca3af', fontWeight: '500' },
  roleTab: { padding: '8px 14px', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  metricsBar: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '30px' },
  metricCard: { backgroundColor: '#111827', border: '1px solid #1f2937', padding: '15px', borderRadius: '8px', fontSize: '14px', textAlign: 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #1f2937', paddingBottom: '24px' },
  title: { fontSize: '28px', fontWeight: '700', margin: 0, background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#9ca3af', margin: '4px 0 0 0', fontSize: '14px' },
  btnGroup: { display: 'flex', gap: '12px' },
  addButton: { padding: '10px 20px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  secondaryButton: { padding: '10px 20px', backgroundColor: '#1f2937', color: '#f3f4f6', border: '1px solid #374151', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }
};
