export function hasPermission(permissionCodes: string[], permission: string) {
  return permissionCodes.includes(permission) || permissionCodes.includes(`PERM_${permission}`);
}
