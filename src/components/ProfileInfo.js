const ProfileInfo = ({ user }) => {
  if (!user) {
    return <p className="empty-state">No profile information available.</p>;
  }

  return (
    <div className="profile-info-modal">
      <div className="profile-avatar">
        {user.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
      <div className="profile-details">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.roleId?.displayValue || user.roleId?.name || user.roleName}</p>
        {user.createdAt && (
          <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
