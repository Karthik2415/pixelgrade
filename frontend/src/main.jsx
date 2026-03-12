import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

import TrainerRoomList from './pages/trainer/RoomList';
import TrainerRoomDetails from './pages/trainer/RoomDetails';
import CreateQuestion from './pages/trainer/CreateQuestion';
import Analytics from './pages/trainer/Analytics';
import Leaderboard from './pages/trainer/Leaderboard';
import TrainerContestList from './pages/trainer/ContestList';
import CreateContest from './pages/trainer/CreateContest';

import StudentRoomList from './pages/student/RoomList';
import StudentRoomDetails from './pages/student/RoomDetails';
import Workspace from './pages/student/Workspace';
import ResultViewer from './pages/student/ResultViewer';
import StudentContestList from './pages/student/ContestList';
import ContestDashboard from './pages/student/ContestDashboard';
import ContestWorkspace from './pages/student/ContestWorkspace';

import ContestLeaderboard from './pages/shared/ContestLeaderboard';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Trainer Routes */}
            <Route path="/trainer/rooms" element={<TrainerRoomList />} />
            <Route path="/trainer/rooms/:roomId" element={<TrainerRoomDetails />} />
            <Route path="/trainer/rooms/:roomId/tasks/new" element={<CreateQuestion />} />
            <Route path="/trainer/analytics" element={<Analytics />} />
            <Route path="/trainer/leaderboard" element={<Leaderboard />} />
            
            {/* Trainer Contest Routes */}
            <Route path="/trainer/contests" element={<TrainerContestList />} />
            <Route path="/trainer/contests/new" element={<CreateContest />} />
            <Route path="/trainer/contests/:id/leaderboard" element={<ContestLeaderboard />} />
            
            {/* Student Routes */}
            <Route path="/student/rooms" element={<StudentRoomList />} />
            <Route path="/student/rooms/:roomId" element={<StudentRoomDetails />} />
            <Route path="/student/workspace/:id" element={<Workspace />} />
            <Route path="/student/results/:id" element={<ResultViewer />} />
            <Route path="/student/leaderboard" element={<Leaderboard />} />
            
            {/* Student Contest Routes */}
            <Route path="/student/contests" element={<StudentContestList />} />
            <Route path="/student/contests/:id" element={<ContestDashboard />} />
            <Route path="/student/contests/:id/workspace/:questionId" element={<ContestWorkspace />} />
            <Route path="/student/contests/:id/leaderboard" element={<ContestLeaderboard />} />
            
            <Route path="/student/dashboard" element={<Navigate to="/student/rooms" replace />} />
            <Route path="/trainer/dashboard" element={<Navigate to="/trainer/rooms" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
