import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SignIn, SignUp, UserButton } from '@clerk/clerk-react';
import { Authenticated, Unauthenticated, AuthLoading, useConvexAuth } from 'convex/react';
import { ProjectsListPage } from './features/projects/pages/ProjectsListPage';
import { ProjectPage } from './features/projects/pages/ProjectPage';
import { ProjectSettingsPage } from './features/projects/pages/ProjectSettingsPage';
import { useEffect } from 'react';

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Report Writer</h1>
        <UserButton />
      </header>
      <main>{children}</main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/sign-in', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/sign-in/*" 
          element={
            <div className="flex items-center justify-center min-h-screen">
              <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
            </div>
          } 
        />
        <Route 
          path="/sign-up/*" 
          element={
            <div className="flex items-center justify-center min-h-screen">
              <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
            </div>
          } 
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProjectsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id/settings"
          element={
            <ProtectedRoute>
              <ProjectSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
