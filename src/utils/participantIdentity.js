import { ROLES } from '../data/roles.js'

export function getParticipantIdentity(missionState = {}, roleId) {
  const effectiveRoleId = roleId || missionState.exercise?.selectedRole || missionState.activeRole
  const role = ROLES.find((item) => item.id === effectiveRoleId)
  const roleName = role?.name || role?.shortName || 'Role not selected'
  const participantName = (missionState.exercise?.participantName || '').trim()

  return {
    participantName,
    roleId: effectiveRoleId,
    roleName,
    primary: participantName || roleName,
    secondary: participantName ? roleName : '',
  }
}
