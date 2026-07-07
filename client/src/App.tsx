import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './features/auth/LoginForm';
import { SignupForm } from './features/auth/SignupForm';
import { SchemesPage } from './features/schemes/SchemesPage';
import { SchemeDetail } from './features/schemes/SchemeDetail';
import { EligibilityQuiz } from './features/profile/EligibilityQuiz';
import { ProfilePage } from './features/profile/ProfilePage';
import { BookmarkList } from './features/bookmarks/BookmarkList';
import { ApplicationTracker } from './features/tracker/ApplicationTracker';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { LandingPage } from './features/landing/LandingPage';
import { Navbar } from './components/layout/Navbar';
import { useAuthStore } from './store/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/schemes" /> : <LandingPage />} />
        
        <Route path="/login" element={
          !isAuthenticated ? (
            <div className="relative min-h-screen overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800"></div>
              {/* Decorative blobs */}
              <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
              
              {/* Content */}
              <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
                <div className="space-y-8 w-full max-w-6xl">
                  <div className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">YojanaTrack</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">Discover Government Schemes Made Simple</p>
                  </div>
                  <div className="flex justify-center">
                    <LoginForm />
                  </div>
                </div>
              </div>
            </div>
          ) : <Navigate to="/schemes" />
        } />

        <Route path="/signup" element={
          !isAuthenticated ? (
            <div className="relative min-h-screen overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800"></div>
              {/* Decorative blobs */}
              <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
              
              {/* Content */}
              <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
                <div className="space-y-8 w-full max-w-6xl">
                  <div className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">YojanaTrack</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">Join millions finding opportunities</p>
                  </div>
                  <div className="flex justify-center">
                    <SignupForm />
                  </div>
                </div>
              </div>
            </div>
          ) : <Navigate to="/schemes" />
        } />
        
        {/* Protected Routes */}
        <Route path="/schemes" element={isAuthenticated ? <SchemesPage /> : <Navigate to="/login" />} />
        <Route path="/schemes/:slug" element={isAuthenticated ? <SchemeDetail /> : <Navigate to="/login" />} />
        <Route path="/find-scheme" element={isAuthenticated ? <EligibilityQuiz /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/bookmarks" element={isAuthenticated ? <BookmarkList /> : <Navigate to="/login" />} />
        <Route path="/tracker" element={isAuthenticated ? <ApplicationTracker /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuthenticated && user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} />
        
        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;

