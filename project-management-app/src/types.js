export const EMPLOYEES = [
  { id: 'EMP-101', name: 'Sarah Connor', avatar: '👩‍💻' },
  { id: 'EMP-102', name: 'Alex Mercer', avatar: '👨‍💻' },
  { id: 'EMP-103', name: 'Elena Rostova', avatar: '👩‍🔬' },
];

export const INITIAL_TASKS = [
  { id: '1', title: 'Setup Project Repository', description: 'Initialize git, configure eslint & prettier.', status: 'todo', assignedTo: 'EMP-101' },
  { id: '2', title: 'Design Database Schema', description: 'Create PostgreSQL schema for users and tasks.', status: 'in-progress', assignedTo: 'EMP-102' },
  { id: '3', title: 'Auth Implementation', description: 'JWT authentication backend endpoints.', status: 'done', assignedTo: 'EMP-103' },
];