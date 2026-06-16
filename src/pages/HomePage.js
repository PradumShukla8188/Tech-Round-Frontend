import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getActiveBlogs } from '../api/blogApi';
import { getErrorMessage } from '../api/apiClient';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import { InContentAd1 } from '../components/ads/AdPlacements';

const ITEMS_PER_PAGE = 6;

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { page, setPage, totalPages, paginatedItems, totalItems, itemsPerPage } =
    usePagination(blogs, ITEMS_PER_PAGE);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await getActiveBlogs();
        setBlogs(res.data.data || []);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const renderBlogItems = () =>
    paginatedItems.map((blog) => (
      <Link to={`/posts/${blog._id}`} key={blog._id} className="blog-card card">
        <h3>{blog.title}</h3>
        <p className="blog-excerpt">
          {blog.content.length > 120
            ? `${blog.content.substring(0, 120)}...`
            : blog.content}
        </p>
        <div className="blog-meta">
          <span>{blog.userId?.name || 'Unknown'}</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>
      </Link>
    ));

  return (
    <Layout>
      <div className="page-header row-between">
        <div>
          <h1>Latest Blogs</h1>
          <p>Read the latest posts from our community</p>
        </div>
        {totalItems > 0 && <span className="list-count">{totalItems} posts</span>}
      </div>
      <InContentAd1 />
      {loading ? (
        <div className="loading">Loading blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="empty-state card">No blogs published yet.</div>
      ) : (
        <>
          <div className="blog-grid">{renderBlogItems()}</div>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
          />
        </>
      )}
    </Layout>
  );
};

export default HomePage;
