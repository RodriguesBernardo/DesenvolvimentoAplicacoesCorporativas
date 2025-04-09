// src/App.js
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Componente de Loading
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center my-5">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Componente ErrorBoundary
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error) => {
      console.error('Error caught by ErrorBoundary:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  return hasError ? (
    <div className="alert alert-danger m-3">
      Ocorreu um erro inesperado. Por favor, recarregue a página.
    </div>
  ) : children;
};

// Lazy loading para páginas
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const SerieDetail = lazy(() => import('./pages/SeriesDetail'));
const SearchPage = lazy(() => import('./pages/Search'));
const MoviesPage = lazy(() => import('./pages/Movies'));
const SeriesPage = lazy(() => import('./pages/Series'));
const SettingsPage = lazy(() => import('./pages/Settings'));

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          
          <main className="flex-grow-1">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Rotas protegidas */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/watchlist" element={
                    <ProtectedRoute>
                      <Watchlist />
                    </ProtectedRoute>
                  } />
                  
                  {/* Rotas públicas */}
                  <Route path="/movies" element={<MoviesPage />} />
                  <Route path="/movie/:id" element={<MovieDetail />} />
                  
                  <Route path="/series" element={<SeriesPage />} />
                  <Route path="/series/:id" element={<SerieDetail />} />
                  
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/home" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;