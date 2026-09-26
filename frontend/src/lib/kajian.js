// Who may add kajian, and who may edit or delete one — the server's rules
// (KajianController.CanWrite / CanManage), used here only to show the controls.
export function canWriteKajian(me) {
  return me?.role === "Guru" || me?.role === "Admin";
}

export function canManageKajian(me, kajian) {
  if (!me || !kajian) return false;
  return me.role === "Admin" || (me.role === "Guru" && String(me.id) === String(kajian.ustadz?.id));
}

export const STATUS_LABELS = { live: "Live", scheduled: "Jadwal", recorded: "Rekaman" };
