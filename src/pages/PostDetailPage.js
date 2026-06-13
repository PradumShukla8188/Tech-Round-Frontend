import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBlogById } from '../api/blogApi';
import { getErrorMessage } from '../api/apiClient';
import Layout from '../components/Layout';
import { InContentAd1, InContentAd2 } from '../components/ads/AdPlacements';

const splitContent = (content) => {
  if (!content || content.length < 100) {
    return { part1: content || '', part2: '', part3: '' };
  }
  const third = Math.floor(content.length / 3);
  return {
    part1: content.slice(0, third),
    part2: content.slice(third, third * 2),
    part3: content.slice(third * 2),
  };
};

const PostDetailPage = () => {
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
        <div className="loading">Loading post...</div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <div className="empty-state card">Post not found.</div>
      </Layout>
    );
  }

  const { part1, part2, part3 } = splitContent(blog.content);

  return (
    <Layout>
      <div className="post-detail card">
        <Link to="/" className="back-link">&larr; Back to Home</Link>
        <h1>{blog.title}</h1>
        <div className="post-meta">
          <span>By {blog.userId?.name || 'Unknown'}</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          <span className={`status-badge status-${blog.status}`}>{blog.status}</span>
        </div>
        <div className="post-content">
          {part1}
          <InContentAd1 />
          {part2}
          <InContentAd2 />
          {part3}
        </div>
      </div>
    </Layout>
  );
};

export default PostDetailPage;
