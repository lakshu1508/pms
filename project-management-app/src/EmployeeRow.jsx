import React from 'react';
import TaskItem from './TaskItem';

export default function EmployeeRow({ employee, tasks, currentRole, moveTask, deleteTask, addComment, onRefresh }) {
  
  const handleDeleteEmployee = async () => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/${employee.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert("Employee deleted successfully!");
          if (onRefresh) onRefresh(); // This triggers the main dashboard to refresh its lists
        } else {
          alert("Failed to delete employee.");
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("An error occurred while deleting the employee.");
      }
    }
  };

  return (
    <div style={styles.rowCard}>
      <div style={styles.profileSection}>
        <span style={styles.avatar}>{employee.avatar}</span>
        <div>
          <h3 style={styles.name}>{employee.name}</h3>
          <span style={styles.idBadge}>{employee.id}</span>
          
          {/* ❌ NEW DELETE BUTTON */}
          <button 
            onClick={handleDeleteEmployee}
            style={styles.deleteButton}
            title="Delete Employee"
          >
            🗑️ Delete
          </button>
        </div>
        <div style={styles.workloadCounter}>Workload: <strong>{tasks.length}</strong></div>
      </div>
      
      <div style={styles.tasksSection}>
        {tasks.length === 0 ? (
          <div style={styles.noTasks}>No active assignments in pipeline.</div>
        ) : (
          <div style={styles.tasksGrid}>
            {tasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                currentRole={currentRole} 
                moveTask={moveTask} 
                deleteTask={deleteTask} 
                addComment={addComment} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  rowCard: { display: 'flex', backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', overflow: 'hidden', minHeight: '110px', marginBottom: '16px' },
  profileSection: { width: '260px', padding: '20px', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' },
  avatar: { fontSize: '32px', background: '#0b0f19', padding: '8px', borderRadius: '50%' },
  name: { margin: 0, fontSize: '16px', fontWeight: '600', color: '#f3f4f6' },
  idBadge: { fontFamily: 'monospace', fontSize: '11px', color: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '8px' },
  workloadCounter: { position: 'absolute', bottom: '10px', right: '15px', fontSize: '11px', color: '#9ca3af' },
  tasksSection: { flex: 1, padding: '16px', display: 'flex', alignItems: 'center', backgroundColor: '#0f172a' },
  noTasks: { color: '#6b7280', fontSize: '14px', fontStyle: 'italic' },
  tasksGrid: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  
  // 🎨 STYLING FOR THE NEW BUTTON
  deleteButton: {
    display: 'block',
    marginTop: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '2px 0px',
    textAlign: 'left',
    transition: 'color 0.2s'
  }
};
