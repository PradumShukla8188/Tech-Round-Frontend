import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllUsers, createUser, updateUser, deleteUser } from '../../api/userApi';
import { getErrorMessage } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import UserForm from '../../components/UserForm';
import Modal from '../../components/Modal';
import ProfileInfo from '../../components/ProfileInfo';
import Pagination from '../../components/Pagination';
import { useConfirm } from '../../context/ConfirmContext';
import { usePagination } from '../../hooks/usePagination';
import { InContentAd1, InContentAd2 } from '../../components/ads/AdPlacements';

const ITEMS_PER_PAGE = 5;

const AdminUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formInitial, setFormInitial] = useState(null);
  const confirm = useConfirm();

  const { page, setPage, totalPages, paginatedItems, totalItems, itemsPerPage } =
    usePagination(users, ITEMS_PER_PAGE);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingId(null);
    setFormInitial(null);
  };

  const openCreate = () => {
    setFormInitial({ name: '', email: '', password: '', role: 'user' });
    setCreateModalOpen(true);
  };

  const openEdit = (userRecord) => {
    setEditingId(userRecord._id);
    setFormInitial({
      name: userRecord.name,
      email: userRecord.email,
      password: '',
      role: userRecord.roleId?.name || 'user',
    });
    setEditModalOpen(true);
  };

  const handleCreateSubmit = async (formValues) => {
    try {
      await createUser(formValues);
      toast.success('User created successfully!');
      setCreateModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleEditSubmit = async (formValues) => {
    try {
      const payload = { name: formValues.name, email: formValues.email, role: formValues.role };
      if (formValues.password?.trim()) payload.password = formValues.password;
      await updateUser(editingId, payload);
      toast.success('User updated successfully!');
      closeEditModal();
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;
    try {
      await deleteUser(id);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Layout>
      <div className="page-header row-between">
        <div>
          <h1>Users Management</h1>
          <p>Create, view, edit, and delete users</p>
        </div>
        <div className="dashboard-actions">
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={() => setProfileModalOpen(true)}
          >
            My Profile
          </button>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Create New User
          </button>
        </div>
      </div>

      <Modal open={profileModalOpen} title="My Profile" onClose={() => setProfileModalOpen(false)}>
        <ProfileInfo user={user} />
      </Modal>

      <Modal
        open={createModalOpen}
        title="Create New User"
        onClose={() => setCreateModalOpen(false)}
        size="lg"
      >
        {createModalOpen && formInitial && (
          <UserForm
            key="create-user"
            initialValues={formInitial}
            onSubmit={handleCreateSubmit}
            onCancel={() => setCreateModalOpen(false)}
            inModal
          />
        )}
      </Modal>

      <Modal open={editModalOpen} title="Edit User" onClose={closeEditModal} size="lg">
        {editModalOpen && formInitial && editingId && (
          <UserForm
            key={editingId}
            editingId={editingId}
            initialValues={formInitial}
            onSubmit={handleEditSubmit}
            onCancel={closeEditModal}
            inModal
          />
        )}
      </Modal>

      <div className="in-content-ads-row">
        <InContentAd1 />
        <InContentAd2 />
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state card">No users found. Click &quot;Create New User&quot; to add one.</div>
      ) : (
        <>
          <div className="table-container card">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((userRecord) => (
                    <tr key={userRecord._id}>
                      <td>{userRecord.name}</td>
                      <td>{userRecord.email}</td>
                      <td>{userRecord.roleId?.displayValue || userRecord.roleId?.name}</td>
                      <td>{new Date(userRecord.createdAt).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button type="button" className="btn btn-sm" onClick={() => openEdit(userRecord)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(userRecord._id)}
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

export default AdminUsersPage;
