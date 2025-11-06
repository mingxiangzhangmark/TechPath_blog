import api from "../api";

export async function listComments(postId) {
  const { data } = await api.get("/comments/", { params: { post: postId } });
  return Array.isArray(data) ? data : data.results || [];
}

export async function createComment({ post, content }) {
  const { data } = await api.post("/comments/", { post, content });
  return data;
}

export async function deleteComment(commentId) {
  await api.delete(`/comments/${commentId}/`);
}

export async function editComment(commentId, content) {
  const { data } = await api.patch(`/comments/${commentId}/`, { content });
  return data;
}

// my comments
export async function getMyComments() {
  const res = await api.get("/comments/mine/");
  return res.data;
}
