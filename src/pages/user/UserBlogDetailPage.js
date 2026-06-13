import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBlogById } from '../../api/blogApi';
import { getErrorMessage } from '../../api/apiClient';
import Layout from '../../components/Layout';

const UserBlogDetailPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await getBlogById(id);
        setBlog(res.data.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading blog...</div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <div className="empty-state card">Blog not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="post-detail card">
        <Link to="/user/dashboard" className="back-link">&larr; Back to Dashboard</Link>
        <h1>{blog.title}</h1>
        <div className="post-meta">
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          <span className={`status-badge status-${blog.status}`}>{blog.status}</span>
        </div>
        <div className="post-content">{blog.content}</div>
      </div>
    </Layout>
  );
};

export default UserBlogDetailPage;
