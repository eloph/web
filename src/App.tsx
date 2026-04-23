import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthGuard from './components/AuthGuard';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import PublishPage from './pages/PublishPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import DiaryDetailPage from './pages/DiaryDetailPage';
import NavBar from './components/NavBar';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* 需要认证的路由 */}
          <Route element={<AuthGuard />}>
            <Route path="/" element={<>
              <HomePage />
              <NavBar />
            </>} />
            <Route path="/map" element={<>
              <MapPage />
              <NavBar />
            </>} />
            <Route path="/publish" element={<PublishPage />} />
            <Route path="/notifications" element={<>
              <NotificationsPage />
              <NavBar />
            </>} />
            <Route path="/profile" element={<>
              <ProfilePage />
              <NavBar />
            </>} />
            <Route path="/diary/:id" element={<DiaryDetailPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
