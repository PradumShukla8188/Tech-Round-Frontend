import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllBlogs, createBlog, updateBlog, deleteBlog } from '../../api/blogApi';
import { getErrorMessage } from '../../api/apiClient';
import Layout from '../../components/Layout';
import BlogForm from '../../components/BlogForm';
import Modal from '../../components/Modal';
import ProfileInfo from '../../components/ProfileInfo';
import Pagination from '../../components/Pagination';
import { useConfirm } from '../../context/ConfirmContext';
import { useAuth } from '../../context/AuthContext';
import { usePagination } from '../../hooks/usePagination';
import { InContentAd1, InContentAd2 } from '../../components/ads/AdPlacements';

const ITEMS_PER_PAGE = 5;

const AdminPostsPage = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editInitial, setEditInitial] = useState(null);
  const confirm = useConfirm();

  const { page, setPage, totalPages, paginatedItems, totalItems, itemsPerPage } =
    usePagination(blogs, ITEMS_PER_PAGE);

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await getAllBlogs();
      setBlogs(res.data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleCreatePost = async (data) => {
    try {
      await createBlog(data);
      toast.success('Post created successfully!');
      setCreateModalOpen(false);
      fetchBlogs();
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingBlog(null);
    setEditInitial(null);
  };

  const handleUpdatePost = async (data) => {
    try {
      await updateBlog(editingBlog, data);
      toast.success('Post updated successfully!');
      closeEditModal();
      fetchBlogs();
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const toggleStatus = async (blog) => {
    const newStatus = blog.status === 'active' ? 'inactive' : 'active';
    try {
      await updateBlog(blog._id, { status: newStatus });
      toast.success(`Post ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully!`);
      fetchBlogs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openEdit = (blog) => {
    setEditingBlog(blog._id);
    setEditInitial({ title: blog.title, content: blog.content });
    setCreateModalOpen(false);
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;
    try {
      await deleteBlog(id);
      toast.success('Post deleted successfully!');
      fetchBlogs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Layout>
      <div className="page-header row-between">
        <div>
          <h1>Posts Management</h1>
          <p>Create, edit, enable/disable, and delete blog posts</p>
        </div>
        <div className="dashboard-actions">
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={() => setProfileModalOpen(true)}
          >
            My Profile
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              closeEditModal();
              setCreateModalOpen(true);
            }}
          >
            + Create New Post
          </button>
        </div>
      </div>

      <Modal open={profileModalOpen} title="My Profile" onClose={() => setProfileModalOpen(false)}>
        <ProfileInfo user={user} />
      </Modal>

      <Modal
        open={createModalOpen}
        title="Create New Post"
        onClose={() => setCreateModalOpen(false)}
        size="lg"
      >
        {createModalOpen && (
          <BlogForm
            key="create-post"
            onSubmit={handleCreatePost}
            onCancel={() => setCreateModalOpen(false)}
            submitLabel="Create Post"
            inModal
          />
        )}
      </Modal>

      <Modal open={editModalOpen} title="Edit Post" onClose={closeEditModal} size="lg">
        {editModalOpen && editInitial && editingBlog && (
          <BlogForm
            key={editingBlog}
            initialData={editInitial}
            onSubmit={handleUpdatePost}
            onCancel={closeEditModal}
            submitLabel="Update Post"
            inModal
          />
        )}
      </Modal>

      <div className="in-content-ads-row">
        <InContentAd1 />
        <InContentAd2 />
      </div>

      {loading ? (
        <div className="loading">Loading posts...</div>
      ) : blogs.length === 0 ? (
        <div className="empty-state card">No posts found. Click &quot;Create New Post&quot; to add one.</div>
      ) : (
        <>
          <div className="table-container card">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((blog) => (
                    <tr key={blog._id}>
                      <td className="title-cell">{blog.title}</td>
                      <td>{blog.userId?.name || 'Unknown'}</td>
                      <td>
                        <span className={`status-badge status-${blog.status}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className={`btn btn-sm ${blog.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => toggleStatus(blog)}
                        >
                          {blog.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <Link to={`/posts/${blog._id}`} className="btn btn-sm">View</Link>
                        <button type="button" className="btn btn-sm" onClick={() => openEdit(blog)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(blog._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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

export default AdminPostsPage;
