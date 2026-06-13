import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TopBannerAd,
  BottomBannerAd,
  SidebarAd,
  StickyFooterAd,
} from './ads/AdPlacements';

const Layout = ({ children, showSidebar = true }) => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <nav className="navbar">
        <Link to="/" className="nav-brand">Blogging Site</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <>
                  <Link to="/admin/dashboard">Dashboard</Link>
                  <Link to="/admin/users">Users</Link>
                  <Link to="/admin/posts">Posts</Link>
                </>
              ) : (
                <Link to="/user/dashboard">My Dashboard</Link>
              )}
              <span className="nav-user">Hi, {user?.name}</span>
              <button type="button" className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      <TopBannerAd />

      <div className={`page-body ${showSidebar ? 'with-sidebar' : ''}`}>
        {showSidebar && (
          <aside className="sidebar">
            <SidebarAd />
          </aside>
        )}
        <main className="main-content">{children}</main>
      </div>

      <BottomBannerAd />
      <StickyFooterAd />
    </div>
  );
};

export default Layout;
