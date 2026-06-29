import React, { useState, useEffect } from 'react';
import EmployeeRow from './EmployeeRow';
import AddTaskModal from './AddTaskModal';
import AddEmployeeModal from './AddEmployeeModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  // Initialize states directly from localStorage so refreshes don't wipe them
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('currentRole') || null;
  });
  const [loggedInEmployee, setLoggedInEmployee] = useState(() => {
    const savedEmp = localStorage.getItem('loggedInEmployee');
    return savedEmp ? JSON.parse(savedEmp) : null;
  });
  
  // Login Form States
  const [loginEmpId, setLoginEmpId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 🔐 Password Change Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Master Data States
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  // Handle Selection Screen
  const selectAdminRole = () => {
    const pinInput = prompt('🛡️ Enter Admin Passkey PIN:');
    if (pinInput === '1234') {
      setCurrentRole('admin');
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentRole', 'admin');
    } else if (pinInput !== null) {
      alert('❌ Access Denied!');
    }
  };

  // Handle Employee Login Request
  const handleEmployeeLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const cleanId = loginEmpId.trim(); 
      
      const response = await fetch(`${API_BASE_URL}/employee/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cleanId, password: loginPassword.trim() })
      });
      
      const data = await response.json();
      if (response.ok) {
        setLoggedInEmployee(data.employee);
        setCurrentRole('employee');
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentRole', 'employee');
        localStorage.setItem('loggedInEmployee', JSON.stringify(data.employee));
      } else {
        setLoginError(data.detail || 'Invalid Login Details');
      }
    } catch (err) {
      setLoginError('Could not reach backend server.');
    }
  };

  // ⚙️ Process Custom Personal Account Password Upgrade Request
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!oldPassword.trim() || !newPassword.trim()) {
      setPassError('Please fill in all inputs fields.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/employee/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: loggedInEmployee?.id,
          old_password: oldPassword.trim(),
          new_password: newPassword.trim()
        })
      });

      const data = await response.json();
      if (response.ok) {
        setPassSuccess('Password updated securely!');
        setOldPassword('');
        setNewPassword('');
        // Autoclose popup frame context cleanly after 2 seconds
        setTimeout(() => setIsPasswordModalOpen(false), 2000);
      } else {
        setPassError(data.detail || 'Failed to update security keys.');
      }
    } catch (err) {
      setPassError('Error establishing sync link to network server.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRole(null);
    setLoggedInEmployee(null);
    setLoginEmpId('');
    setLoginPassword('');
    setLoginError('');
    localStorage.clear();
  };

  // --- CRUD OPERATIONS ---
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
      body: JSON.stringify({ title, description, assigned_to: assignedTo, status, priority, due_date })
    });
    setIsTaskModalOpen(false);
    fetchAllData();
  };

  const deleteTask = async (taskId) => {
    await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
    fetchAllData();
  };

  const addComment = async (taskId, text) => {
    const author = currentRole === 'admin' ? "👑 Administrator" : `🛠️ ${loggedInEmployee?.name || 'Team Member'}`;
    await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text })
    });
    fetchAllData();
  };

  const addEmployee = async (name, customId, avatar) => {
    const formattedId = customId.trim();
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

  // --- RENDERING VIEWS ---

  // SCREEN 1: Welcome / Role Selection Portal Screen
  if (!isAuthenticated && currentRole !== 'employee_login') {
    return (
      <div style={styles.portalContainer}>
        <div style={styles.portalCard}>
          <h1 style={styles.portalTitle}>Business Management Suite</h1>
          <p style={styles.portalSubtitle}>Please select your clearance path to continue</p>
          <div style={styles.portalGrid}>
            <button style={styles.adminPortalBtn} onClick={selectAdminRole}>
              <div style={{ fontSize: '40px' }}>👑</div>
              <div style={styles.portalBtnTitle}>Admin Portal</div>
              <div style={styles.portalBtnDesc}>Manage staff, distribute tasks, view company performance analytics.</div>
            </button>
            <button style={styles.empPortalBtn} onClick={() => setCurrentRole('employee_login')}>
              <div style={{ fontSize: '40px' }}>🛠️</div>
              <div style={styles.portalBtnTitle}>Employee Portal</div>
              <div style={styles.portalBtnDesc}>Access your personal private workspace and manage ongoing jobs.</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: Secure Employee Login Form Screen
  if (currentRole === 'employee_login' && !isAuthenticated) {
    return (
      <div style={styles.portalContainer}>
        <div style={styles.loginCard}>
          <button style={styles.backLink} onClick={() => setCurrentRole(null)}>⬅️ Back to Portal Selection</button>
          <h2 style={{ ...styles.portalTitle, fontSize: '24px', marginTop: '15px' }}>Employee Log In</h2>
          <p style={{ ...styles.portalSubtitle, marginBottom: '25px' }}>Enter your credentials to securely retrieve your task sheet.</p>
          
          <form onSubmit={handleEmployeeLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Employee ID Code</label>
              <input type="text" placeholder="e.g. IN0336" value={loginEmpId} onChange={(e) => setLoginEmpId(e.target.value)} style={styles.input} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Security Password</label>
              <input type="password" placeholder="Defaults to Employee ID if unset" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={styles.input} required />
            </div>
            {loginError && <div style={styles.errorBanner}>⚠️ {loginError}</div>}
            <button type="submit" style={styles.loginSubmitBtn}>Verify Credentials & Enter</button>
          </form>
        </div>
      </div>
    );
  }

  // SCREEN 3: Active Dashboard View
  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.roleBar}>
        <span style={styles.roleLabel}>🔐 Authenticated Context:</span>
        <span style={styles.statusBadge}>
          {currentRole === 'admin' ? '👑 SYSTEM ADMINISTRATOR' : `🛠️ PRIVACY ISOLATED WORKSPACE (${loggedInEmployee?.id})`}
        </span>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* ⚙️ CHANGE PASSWORD BUTTON: visible strictly to an authenticated employee session */}
          {currentRole === 'employee' && (
            <button 
              style={styles.settingsBtn} 
              onClick={() => { setIsPasswordModalOpen(true); setPassError(''); setPassSuccess(''); }}
            >
              ⚙️ Change Password
            </button>
          )}
          <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Sign Out</button>
        </div>
      </div>

      {currentRole === 'admin' && (
        <div style={styles.metricsBar}>
          <div style={styles.metricCard}>💻 Velocity: <strong>{metrics.completion_rate}% Done</strong></div>
          <div style={{...styles.metricCard, color: metrics.critical_count > 0 ? '#ef4444' : '#f3f4f6'}}>🚨 Critical Actions: <strong>{metrics.critical_count} Open</strong></div>
        </div>
      )}

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Project Management Portal</h1>
          <p style={styles.subtitle}>
            Welcome back, <strong>{currentRole === 'admin' ? 'Administrator' : loggedInEmployee?.name}</strong>
          </p>
        </div>
        {currentRole === 'admin' && (
          <div style={styles.btnGroup}>
            <button style={styles.secondaryButton} onClick={() => setIsEmpModalOpen(true)}>👤 Onboard Employee</button>
            <button style={styles.addButton} onClick={() => setIsTaskModalOpen(true)}>⚡ Assign Priority Task</button>
          </div>
        )}
      </header>

      <div style={styles.listContainer}>
        {currentRole === 'admin' ? (
          employees.map(emp => (
            <EmployeeRow 
              key={emp.id} 
              employee={emp} 
              currentRole={currentRole}
              tasks={tasks.filter(t => t.assigned_to === emp.id || t.assignedTo === emp.id)}
              moveTask={moveTask} 
              deleteTask={deleteTask} 
              addComment={addComment}
              onDelete={() => deleteEmployee(emp.id)}
            />
          ))
        ) : (
          employees.filter(emp => emp.id === loggedInEmployee?.id).map(emp => (
            <EmployeeRow 
              key={emp.id} 
              employee={emp} 
              currentRole={currentRole}
              tasks={tasks.filter(t => t.assigned_to === emp.id || t.assignedTo === emp.id)}
              moveTask={moveTask} 
              deleteTask={deleteTask} 
              addComment={addComment}
              onDelete={null}
            />
          ))
        )}
      </div>

      {/* 🔹 SECURITY MODAL POPUP */}
      {isPasswordModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitleText}>⚙️ Update Profile Password</h3>
            <p style={styles.modalSubtitleText}>Change your custom private login access key keys safely.</p>
            
            <form onSubmit={handlePasswordChangeSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Current Security Password</label>
                <input 
                  type="password" 
                  placeholder="Enter current password" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  style={styles.input} 
                  required 
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>New Custom Password</label>
                <input 
                  type="password" 
                  placeholder="Enter unique new password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  style={styles.input} 
                  required 
                />
              </div>

              {passError && <div style={styles.errorBanner}>❌ {passError}</div>}
              {passSuccess && <div style={styles.successBanner}>✅ {passSuccess}</div>}

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  style={styles.cancelBtn} 
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.savePasswordBtn}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTaskModalOpen && <AddTaskModal employees={employees} onSave={addTask} onClose={() => setIsTaskModalOpen(false)} />}
      {isEmpModalOpen && <AddEmployeeModal onSave={addEmployee} onClose={() => setIsEmpModalOpen(false)} />}
    </div>
  );
}

const styles = {
  portalContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#05070f', fontFamily: '"Inter", sans-serif', padding: '20px' },
  portalCard: { maxWidth: '800px', width: '100%', textAlign: 'center' },
  portalTitle: { fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  portalSubtitle: { color: '#9ca3af', fontSize: '15px', margin: '0 0 40px 0' },
  portalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  adminPortalBtn: { padding: '30px', backgroundColor: '#0b0f19', border: '2px solid #312e81', borderRadius: '12px', color: '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', width: '100%' },
  empPortalBtn: { padding: '30px', backgroundColor: '#0b0f19', border: '2px solid #064e3b', borderRadius: '12px', color: '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', width: '100%' },
  portalBtnTitle: { fontSize: '18px', fontWeight: '700', margin: '15px 0 8px 0' },
  portalBtnDesc: { fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' },
  loginCard: { backgroundColor: '#0b0f19', border: '1px solid #1f2937', padding: '40px', borderRadius: '16px', maxWidth: '400px', width: '100%' },
  backLink: { background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px', padding: 0, fontWeight: '500' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' },
  input: { padding: '12px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px' },
  loginSubmitBtn: { padding: '12px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
  errorBanner: { padding: '10px', backgroundColor: '#7f1d1d', border: '1px solid #f87171', color: '#fca5a5', borderRadius: '6px', fontSize: '13px' },
  successBanner: { padding: '10px', backgroundColor: '#064e3b', border: '1px solid #34d399', color: '#a7f3d0', borderRadius: '6px', fontSize: '13px' },
  dashboardContainer: { padding: '40px', fontFamily: '"Inter", sans-serif', backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh' },
  roleBar: { display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#111827', padding: '12px 20px', borderRadius: '8px', border: '1px solid #1f2937', marginBottom: '30px' },
  roleLabel: { fontSize: '13px', color: '#9ca3af', fontWeight: '500' },
  statusBadge: { fontSize: '12px', fontWeight: '700', color: '#38bdf8', letterSpacing: '0.5px' },
  settingsBtn: { padding: '6px 12px', backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #374151', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: '0.2s' },
  logoutBtn: { padding: '6px 12px', backgroundColor: '#1f2937', color: '#f3f4f6', border: '1px solid #374151', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  metricsBar: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '30px' },
  metricCard: { backgroundColor: '#111827', border: '1px solid #1f2937', padding: '15px', borderRadius: '8px', fontSize: '14px', textAlign: 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #1f2937', paddingBottom: '24px' },
  title: { fontSize: '28px', fontWeight: '700', margin: 0, background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#9ca3af', margin: '4px 0 0 0', fontSize: '14px' },
  btnGroup: { display: 'flex', gap: '12px' },
  addButton: { padding: '10px 20px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  secondaryButton: { padding: '10px 20px', backgroundColor: '#1f2937', color: '#f3f4f6', border: '1px solid #374151', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' },
  
  // Modal Style Sheets
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { backgroundColor: '#0b0f19', border: '1px solid #1f2937', padding: '30px', borderRadius: '16px', maxWidth: '400px', width: '100%' },
  modalTitleText: { fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0', color: '#fff' },
  modalSubtitleText: { color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' },
  cancelBtn: { padding: '10px 16px', backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  savePasswordBtn: { padding: '10px 16px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }
};
