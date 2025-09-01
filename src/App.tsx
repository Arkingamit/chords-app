import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider } from './contexts/AuthContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { SongProvider } from './contexts/SongContext';
// Import the ThemeProvider from the correct path and ensure it's not duplicated
import { ThemeProvider } from './contexts/ThemeContext';
import { GroupProvider } from './contexts/groups';
import { Toaster } from './components/ui/toaster';

import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage'; // Import the new LandingPage component

import Index from './pages/Index';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import SongAdd from './pages/SongAdd';
import SongEdit from './pages/SongEdit';
import SongList from './pages/SongList';
import SongDetail from './pages/SongDetail';
import OrganizationList from './pages/OrganizationList';
import OrganizationAdd from './pages/OrganizationAdd';
import OrganizationEdit from './pages/OrganizationEdit';
import OrganizationDetail from './pages/OrganizationDetail';
import GroupList from './pages/GroupList';
import GroupAdd from './pages/GroupAdd';
import GroupEdit from './pages/GroupEdit';
import GroupDetail from './pages/GroupDetail';
import AdminDashboard from './pages/AdminDashboard';
import ThemeTransition from './components/ThemeTransition'; // Correct path for ThemeTransition

function App() {
  const [loading, setLoading] = useState(true);

  // This function will be called by LandingPage when its animation is complete
  const handleLandingAnimationComplete = () => {
    setLoading(false);
  };

  if (loading) {
    return <LandingPage onAnimationComplete={handleLandingAnimationComplete} />;
  }

  return (
    <GoogleOAuthProvider clientId="810353645969-dmsbou0itk6475tap5j8qq7ejvs68dm7.apps.googleusercontent.com">
      <ThemeProvider> {/* This ThemeProvider is from your contexts folder */}
        <AuthProvider>
          <OrganizationProvider>
            <SongProvider>
              <GroupProvider>
                <BrowserRouter>
                  <Navigation />
                  <main className="min-h-[calc(100vh-64px)] bg-background">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/songs" element={<SongList />} />
                      <Route path="/songs/new" element={<SongAdd />} />
                      <Route path="/songs/:id" element={<SongDetail />} />
                      <Route path="/songs/:id/edit" element={<SongEdit />} />
                      <Route path="/organizations" element={<OrganizationList />} />
                      <Route path="/organizations/new" element={<OrganizationAdd />} />
                      <Route path="/organizations/:id" element={<OrganizationDetail />} />
                      <Route path="/organizations/:id/edit" element={<OrganizationEdit />} />
                      <Route path="/groups" element={<GroupList />} />
                      <Route path="/groups/new" element={<GroupAdd />} />
                      <Route path="/groups/:id" element={<GroupDetail />} />
                      <Route path="/groups/:id/edit" element={<GroupEdit />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                  </main>
                  <Toaster />
                </BrowserRouter>
              </GroupProvider>
            </SongProvider>
          </OrganizationProvider>
        </AuthProvider>
        {/* Place ThemeTransition here, inside ThemeProvider,
            but outside the BrowserRouter and main content, so it can overlay everything. */}
        <ThemeTransition />
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;