import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyBlogs, createBlog, updateBlog, deleteBlog } from '../../api/blogApi';
import { getErrorMessage } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import Layout from '../../components/Layout';
import BlogForm from '../../components/BlogForm';
import Modal from '../../components/Modal';
import ProfileInfo from '../../components/ProfileInfo';
import ThreeDotMenu from '../../components/ThreeDotMenu';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

const ITEMS_PER_PAGE = 5;

const UserDashboardPage = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editInitial, setEditInitial] = useState(null);
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { page, setPage, totalPages, paginatedItems, totalItems, itemsPerPage } =
    usePagination(blogs, ITEMS_PER_PAGE);

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await getMyBlogs();
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

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingBlog(null);
    setEditInitial(null);
  };

  const handleCreateBlog = async (data) => {
    try {
      await createBlog(data);
      toast.success('Blog created successfully!');
      setCreateModalOpen(false);
      fetchBlogs();
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const handleUpdateBlog = async (data) => {
    try {
      await updateBlog(editingBlog, data);
      toast.success('Blog updated successfully!');
      closeEditModal();
      fetchBlogs();
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const openEdit = (blog) => {
    setEditingBlog(blog._id);
    setEditInitial({ title: blog.title, content: blog.content });
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Blog',
      message: 'Are you sure you want to delete this blog? This action cannot be undone.',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;
    try {
      await deleteBlog(id);
      toast.success('Blog deleted successfully!');
      fetchBlogs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Layout>
      <div className="page-header row-between">
        <div>
          <h1>User Dashboard</h1>
          <p>Manage your profile and blogs</p>
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
            onClick={() => setCreateModalOpen(true)}
          >
            + Add New Blog
          </button>
        </div>
      </div>

      <Modal open={profileModalOpen} title="My Profile" onClose={() => setProfileModalOpen(false)}>
        <ProfileInfo user={user} />
      </Modal>

      <Modal
        open={createModalOpen}
        title="Add New Blog"
        onClose={() => setCreateModalOpen(false)}
        size="lg"
      >
        {createModalOpen && (
          <BlogForm
            key="create-blog"
            onSubmit={handleCreateBlog}
            onCancel={() => setCreateModalOpen(false)}
            submitLabel="Add Blog"
            inModal
          />
        )}
      </Modal>

      <Modal open={editModalOpen} title="Edit Blog" onClose={closeEditModal} size="lg">
        {editModalOpen && editInitial && editingBlog && (
          <BlogForm
            key={editingBlog}
            initialData={editInitial}
            onSubmit={handleUpdateBlog}
            onCancel={closeEditModal}
            submitLabel="Update Blog"
            inModal
          />
        )}
      </Modal>

      <div className="section-header row-between">
        <h2>My Blogs</h2>
        {totalItems > 0 && (
          <span className="list-count">{totalItems} total</span>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading your blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="empty-state card">
          You haven&apos;t added any blogs yet. Click &quot;+ Add New Blog&quot; to create one.
        </div>
      ) : (
        <>
          <div className="blog-list-cards">
            {paginatedItems.map((blog) => (
              <div key={blog._id} className="blog-list-card card">
                <div className="blog-list-card-header">
                  <h4>{blog.title}</h4>
                  <ThreeDotMenu
                    onView={() => navigate(`/user/blogs/${blog._id}`)}
                    onEdit={() => openEdit(blog)}
                    onDelete={() => handleDelete(blog._id)}
                  />
                </div>
                <div className="blog-list-card-meta">
                  <span className={`status-badge status-${blog.status}`}>{blog.status}</span>
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="table-container card table-desktop">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((blog) => (
                    <tr key={blog._id}>
                      <td className="title-cell">{blog.title}</td>
                      <td>
                        <span className={`status-badge status-${blog.status}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                      <td className="actions-col">
                        <ThreeDotMenu
                          onView={() => navigate(`/user/blogs/${blog._id}`)}
                          onEdit={() => openEdit(blog)}
                          onDelete={() => handleDelete(blog._id)}
                        />
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

export default UserDashboardPage;
