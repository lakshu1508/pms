import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';

// Dynamically handles local development port overrides and production hosting context
const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://127.0.0.1:8000/api'
  : '/api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [metrics, setMetrics] = useState({ completion_rate: 0, critical_count: 0 });
  const [loading, setLoading] = useState(true);

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
      console.error("Error synchronizing runtime state clusters:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskPayload) => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskPayload,
          status: "TODO" // Explicit uppercase target alignment
        })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error creating new task entry:", err);
    }
  };

  const handleUpdateStatus = async (taskId, currentStatus) => {
    const statusOrder = ["TODO", "IN_PROGRESS", "DONE"];
    const nextIndex = (statusOrder.indexOf(currentStatus.toUpperCase()) + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error mutating task status mapping:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f8fafc' }}>
        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Loading Enterprise Workspace Matrix...</p>
      </div>
    );
  }

  return (
    <Dashboard 
      tasks={tasks} 
      employees={employees} 
      metrics={metrics} 
      onAddTask={handleAddTask} 
      onUpdateStatus={handleUpdateStatus} 
    />
  );
}
