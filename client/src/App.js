import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import socketService from './services/socketService';
import Welcome from './pages/Welcome';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import KickedPage from './pages/KickedPage';

function App() {
  useEffect(() => {
    // Initialize socket connection
    socketService.connect();
    
    // Cleanup on unmount
    return () => {
      if (socketService.socket) {
        socketService.socket.disconnect();
      }
    };
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/kicked" element={<KickedPage />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App; 