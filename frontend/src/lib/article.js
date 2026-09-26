// Who may write articles, and who may edit or delete one — the same rules the server
// enforces (ArticlesController.CanWrite / CanManage), used here only to show the controls.
export function canWriteArticles(me) {
  return me?.role === "Guru" || me?.role === "Admin";
}

// An Admin manages any article; a Guru only their own.
export function canManageArticle(me, article) {
  if (!me || !article) return false;
  return me.role === "Admin" || (me.role === "Guru" && String(me.id) === String(article.author.id));
}
