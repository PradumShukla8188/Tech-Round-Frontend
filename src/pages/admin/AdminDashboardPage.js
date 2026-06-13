import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllBlogs } from '../../api/blogApi';
import { getAllUsers } from '../../api/userApi';
import { getErrorMessage } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import ProfileInfo from '../../components/ProfileInfo';
import { InContentAd1, InContentAd2 } from '../../components/ads/AdPlacements';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, blogs: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, blogsRes] = await Promise.all([getAllUsers(), getAllBlogs()]);
        const users = usersRes.data.data || [];
        const blogs = blogsRes.data.data || [];
        setStats({
          users: users.length,
          blogs: blogs.length,
          active: blogs.filter((b) => b.status === 'active').length,
          inactive: blogs.filter((b) => b.status === 'inactive').length,
        });
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="page-header row-between">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users and blog posts</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={() => setProfileModalOpen(true)}
        >
          My Profile
        </button>
      </div>

      <Modal open={profileModalOpen} title="My Profile" onClose={() => setProfileModalOpen(false)}>
        <ProfileInfo user={user} />
      </Modal>

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.users}</p>
            </div>
            <div className="stat-card card">
              <h3>Total Posts</h3>
              <p className="stat-number">{stats.blogs}</p>
            </div>
            <div className="stat-card card">
              <h3>Active Posts</h3>
              <p className="stat-number">{stats.active}</p>
            </div>
            <div className="stat-card card">
              <h3>Inactive Posts</h3>
              <p className="stat-number">{stats.inactive}</p>
            </div>
          </div>

          <div className="quick-links">
            <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
            <Link to="/admin/posts" className="btn btn-primary">Manage Posts</Link>
          </div>
          <div className="in-content-ads-row">
            <InContentAd1 />
            <InContentAd2 />
          </div>
        </>
      )}
    </Layout>
  );
};

export default AdminDashboardPage;
