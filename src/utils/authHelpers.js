export const getUserRole = (user) => {
  if (!user) return null;
  if (typeof user.roleId === 'object' && user.roleId?.name) {
    return user.roleId.name;
  }
  if (user.role) return user.role;
  if (user.roleName) return user.roleName;
  return null;
};

export const isUserAdmin = (user) => getUserRole(user) === 'admin';
