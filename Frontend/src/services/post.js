import api from "../api";

export async function createPost({ title, content, tags, coverFile }) {
  const fd = new FormData();
  fd.append("title", title);
  fd.append("content", content);
  fd.append("is_published", "true");
  (tags || []).forEach((t) => fd.append("tags", t));
  if (coverFile) fd.append("cover", coverFile);

  const { data } = await api.post("/posts/", fd);
  return data;
}

export async function listPosts(params = {}) {
  const qs = new URLSearchParams();
  if (params.author) qs.append("author", params.author);
  if (params.search) qs.append("search", params.search);
  if (params.tags) qs.append("tags", params.tags);
  if (params.ordering) qs.append("ordering", params.ordering);
  if (params.page) qs.append("page", params.page);
  if (params.limit) qs.append("limit", params.limit);
  if (params.offset) qs.append("offset", params.offset);
  const url = qs.toString() ? `/posts/?${qs.toString()}` : "/posts/";
  const { data } = await api.get(url);
  return data;
}

export async function updatePost(
  slug,
  { title, content, tags, coverFile, is_published = true },
) {
  const fd = new FormData();
  fd.append("title", title);
  fd.append("content", content);
  fd.append("is_published", String(is_published));
  (tags || []).forEach((t) => fd.append("tags", t));
  if (coverFile) fd.append("cover", coverFile);

  const { data } = await api.put(`/posts/${slug}/`, fd);
  return data;
}

export async function deletePost(slug) {
  const { data } = await api.delete(`/posts/${slug}/`);
  return data;
}

// Fetch a single post by slug (public)
export async function getPostBySlug(slug) {
  const { data } = await api.get(`/posts/${slug}/`);
  return data;
}

// Fetch highlighted posts: latest + most_liked
export async function getHighlightedPosts() {
  const { data } = await api.get("/highlighted-posts/");
  return data; // { latest: Post[], most_liked: Post[] }
}

export async function likePost(postId) {
  const { data } = await api.post("/likes/", { post: postId });
  return data;
}

export async function unlikePost(likeId) {
  const { data } = await api.delete(`/likes/${likeId}/`);
  return data;
}

export async function generateBlogContent({ wordcount, prompt_suggestion }) {
  const { data } = await api.post("/generate-blog/", {
    wordcount,
    prompt_suggestion,
  });
  return data.blog_text;
}
