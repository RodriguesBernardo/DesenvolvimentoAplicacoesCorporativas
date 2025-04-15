import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Componente de Loading
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Lazy loading para páginas
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const SerieDetail = lazy(() => import('./pages/SeriesDetail'));
const SearchPage = lazy(() => import('./pages/Search'));
const MoviesPage = lazy(() => import('./pages/Movies'));
const SeriesPage = lazy(() => import('./pages/Series'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const WatchlistPage = lazy(() => import('./pages/Watchlist'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          
          <main className="flex-grow-1">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rotas protegidas */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />

                
                {/* Rotas públicas */}
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/movie/:id" element={<MovieDetail />} />
                <Route path="/series" element={<SeriesPage />} />
                <Route path="/series/:id" element={<SerieDetail />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;