import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import MachineDetails from './pages/MachineDetails';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import Reports from './pages/Reports';
import NewMachine from './pages/NewMachine';
import AssignTask from './pages/AssignTask';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';
import License from './pages/License';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          
          {/* Admin only routes */}
          <Route path="machines" element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <Machines />
            </ProtectedRoute>
          } />
          <Route path="machines/new" element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <NewMachine />
            </ProtectedRoute>
          } />
          <Route path="license" element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <License />
            </ProtectedRoute>
          } />
          <Route path="assign-task" element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <AssignTask />
            </ProtectedRoute>
          } />
          
          {/* Shared routes */}
          <Route path="tasks" element={<Tasks />} />
          <Route path="/tasks/:taskNo/:serialNo/:taskType" element={<TaskDetails />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;