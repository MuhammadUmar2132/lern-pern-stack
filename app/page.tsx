"use client";

import { useState, useEffect, useCallback } from "react";

// --- Types ---
interface Item {
  id: number;
  title: string;
  description: string;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  image_url?: string | null;
  created_at?: string;
}

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  message: string;
  created_at?: string;
}

const API_BASE = "http://localhost:5000/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"items" | "posts" | "users">("items");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // --- Items State ---
  const [items, setItems] = useState<Item[]>([]);
  const [itemTitle, setItemTitle] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [itemUploading, setItemUploading] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [itemLoading, setItemLoading] = useState(false);

  // --- Users State ---
  const [users, setUsers] = useState<User[]>([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  // --- Posts State ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [postUserId, setPostUserId] = useState<number | "">("");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [postFile, setPostFile] = useState<File | null>(null);
  const [postUploading, setPostUploading] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [selectedUserFilter, setSelectedUserFilter] = useState<number | "all">("all");
  const [postLoading, setPostLoading] = useState(false);

  // --- Comments State ---
  const [commentsByPost, setCommentsByPost] = useState<Record<number, Comment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [commentUser, setCommentUser] = useState<Record<number, number | "">>({});

  // --- Feedback / Alerts ---
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- Health Check ---
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/");
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  // --- Fetchers ---
  const fetchItems = useCallback(async () => {
    setItemLoading(true);
    try {
      const res = await fetch(`${API_BASE}/items`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (err) {
      console.error("Fetch items error:", err);
    } finally {
      setItemLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data);
        if (json.data.length > 0 && postUserId === "") {
          setPostUserId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setUserLoading(false);
    }
  }, [postUserId]);

  const fetchPosts = useCallback(async (userId?: number | "all") => {
    setPostLoading(true);
    try {
      const url = userId && userId !== "all" 
        ? `${API_BASE}/posts/user/${userId}` 
        : `${API_BASE}/posts`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPosts(json.data);
      }
    } catch (err) {
      console.error("Fetch posts error:", err);
    } finally {
      setPostLoading(false);
    }
  }, []);

  const fetchComments = async (postId: number) => {
    try {
      const res = await fetch(`${API_BASE}/comments/post/${postId}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCommentsByPost((prev) => ({ ...prev, [postId]: json.data }));
      }
    } catch (err) {
      console.error(`Fetch comments error for post ${postId}:`, err);
    }
  };

  const togglePostComments = (postId: number) => {
    const isExpanded = !!expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }));
    if (!isExpanded && !commentsByPost[postId]) {
      fetchComments(postId);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchItems();
    fetchUsers();
    fetchPosts();
  }, [checkHealth, fetchItems, fetchUsers, fetchPosts]);

  // --- Upload Helper ---
  const handleUploadImage = async (file: File, endpoint: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.data?.url) {
        return json.data.url;
      }
      throw new Error(json.message || "Upload failed");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      showNotification(msg, "error");
      return null;
    }
  };

  // --- Items Actions ---
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) return;

    let finalImageUrl = itemImageUrl;
    if (itemFile) {
      setItemUploading(true);
      const uploaded = await handleUploadImage(itemFile, `${API_BASE}/items/upload`);
      setItemUploading(false);
      if (uploaded) finalImageUrl = uploaded;
    }

    try {
      if (editingItemId) {
        const res = await fetch(`${API_BASE}/items/${editingItemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: itemTitle.trim(),
            description: itemDesc,
            imageUrl: finalImageUrl || null,
          }),
        });
        const json = await res.json();
        if (json.success) {
          showNotification("Item updated successfully!");
          resetItemForm();
          fetchItems();
        } else {
          showNotification(json.message || "Failed to update item", "error");
        }
      } else {
        const res = await fetch(`${API_BASE}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: itemTitle.trim(),
            description: itemDesc,
            imageUrl: finalImageUrl || null,
          }),
        });
        const json = await res.json();
        if (json.success) {
          showNotification("Item created successfully!");
          resetItemForm();
          fetchItems();
        } else {
          showNotification(json.message || "Failed to create item", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showNotification("An error occurred while saving the item", "error");
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItemId(item.id);
    setItemTitle(item.title);
    setItemDesc(item.description || "");
    setItemImageUrl(item.image_url || "");
    setItemFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showNotification("Item deleted");
        fetchItems();
      } else {
        showNotification(json.message || "Failed to delete item", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error deleting item", "error");
    }
  };

  const resetItemForm = () => {
    setEditingItemId(null);
    setItemTitle("");
    setItemDesc("");
    setItemImageUrl("");
    setItemFile(null);
  };

  // --- Users Actions ---
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    try {
      if (editingUserId) {
        const res = await fetch(`${API_BASE}/users/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userName.trim(),
            email: userEmail.trim(),
          }),
        });
        const json = await res.json();
        if (json.success) {
          showNotification("User updated successfully!");
          resetUserForm();
          fetchUsers();
        } else {
          showNotification(json.message || "Failed to update user", "error");
        }
      } else {
        if (!userPassword) {
          showNotification("Password is required for new users", "error");
          return;
        }
        const res = await fetch(`${API_BASE}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userName.trim(),
            email: userEmail.trim(),
            password: userPassword,
          }),
        });
        const json = await res.json();
        if (json.success) {
          showNotification("User created successfully!");
          resetUserForm();
          fetchUsers();
        } else {
          showNotification(json.message || "Failed to create user", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showNotification("An error occurred while saving user", "error");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserPassword("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure? This will also cascade delete all posts & comments by this user!")) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showNotification("User and their data deleted");
        fetchUsers();
        fetchPosts();
      } else {
        showNotification(json.message || "Failed to delete user", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error deleting user", "error");
    }
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserName("");
    setUserEmail("");
    setUserPassword("");
  };

  // --- Posts Actions ---
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || (!editingPostId && !postUserId)) {
      showNotification("Please select an author and write a title", "error");
      return;
    }

    let finalImageUrl = postImageUrl;
    if (postFile) {
      setPostUploading(true);
      const uploaded = await handleUploadImage(postFile, `${API_BASE}/posts/upload`);
      setPostUploading(false);
      if (uploaded) finalImageUrl = uploaded;
    }

    try {
      if (editingPostId) {
        const res = await fetch(`${API_BASE}/posts/${editingPostId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: postTitle.trim(),
            content: postContent,
            imageUrl: finalImageUrl || null,
          }),
        });
        const json = await res.json();
        if (json.success) {
          showNotification("Post updated successfully!");
          resetPostForm();
          fetchPosts(selectedUserFilter);
        } else {
          showNotification(json.message || "Failed to update post", "error");
        }
      } else {
        const res = await fetch(`${API_BASE}/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: Number(postUserId),
            title: postTitle.trim(),
            content: postContent,
            imageUrl: finalImageUrl || null,
          }),
        });
        const json = await res.json();
        if (json.success) {
          showNotification("Post published successfully!");
          resetPostForm();
          fetchPosts(selectedUserFilter);
        } else {
          showNotification(json.message || "Failed to publish post", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showNotification("An error occurred while saving post", "error");
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setPostUserId(post.user_id);
    setPostTitle(post.title);
    setPostContent(post.content || "");
    setPostImageUrl(post.image_url || "");
    setPostFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showNotification("Post deleted");
        fetchPosts(selectedUserFilter);
      } else {
        showNotification(json.message || "Failed to delete post", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error deleting post", "error");
    }
  };

  const resetPostForm = () => {
    setEditingPostId(null);
    setPostTitle("");
    setPostContent("");
    setPostImageUrl("");
    setPostFile(null);
  };

  // --- Comments Actions ---
  const handleAddComment = async (postId: number) => {
    const text = commentText[postId]?.trim();
    const uId = commentUser[postId] || (users.length > 0 ? users[0].id : null);

    if (!text) return;
    if (!uId) {
      showNotification("Please select a user to comment as", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/comments/post/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(uId),
          message: text,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCommentText((prev) => ({ ...prev, [postId]: "" }));
        fetchComments(postId);
        showNotification("Comment added!");
      } else {
        showNotification(json.message || "Failed to add comment", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error adding comment", "error");
    }
  };

  const handleDeleteComment = async (commentId: number, postId: number) => {
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchComments(postId);
        showNotification("Comment removed");
      } else {
        showNotification(json.message || "Failed to delete comment", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error deleting comment", "error");
    }
  };

  const getUserName = (id: number) => {
    const u = users.find((user) => user.id === id);
    return u ? u.name : `User #${id}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div
            className={`px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 backdrop-blur-md ${
              notification.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
                : "bg-rose-950/80 border-rose-500/50 text-rose-200"
            }`}
          >
            <span>{notification.type === "success" ? "✓" : "⚠"}</span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
              P
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">PERN Stack Studio</h1>
              <p className="text-xs text-slate-400">PostgreSQL • Express • React • Node</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Backend Status Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                backendOnline === true
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                  : backendOnline === false
                  ? "bg-rose-950/40 border-rose-500/40 text-rose-400"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline === true
                    ? "bg-emerald-400 animate-pulse"
                    : backendOnline === false
                    ? "bg-rose-400"
                    : "bg-slate-400"
                }`}
              />
              <span>{backendOnline ? "API Live (5000)" : backendOnline === false ? "API Disconnected" : "Checking API..."}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Navigation Tabs & Counters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("items")}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "items"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>📦</span>
              <span>Items</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300">
                {items.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "posts"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>📝</span>
              <span>Posts & Feed</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300">
                {posts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "users"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>👥</span>
              <span>Users</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300">
                {users.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Linked Entities:</span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-indigo-400 font-mono">
              PostgreSQL Tables: 4
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ITEMS (Products / Inventory with Cloudinary Upload) */}
        {/* ========================================================= */}
        {activeTab === "items" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{editingItemId ? "✏️" : "✨"}</span>
                    <span>{editingItemId ? "Edit Item" : "Create New Item"}</span>
                  </h2>
                  {editingItemId && (
                    <button
                      onClick={resetItemForm}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleItemSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      placeholder="e.g. Modern Wireless Headphones"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={itemDesc}
                      onChange={(e) => setItemDesc(e.target.value)}
                      placeholder="Describe this item..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Image (Upload or URL)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setItemFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 file:cursor-pointer"
                      />
                      <input
                        type="text"
                        value={itemImageUrl}
                        onChange={(e) => setItemImageUrl(e.target.value)}
                        placeholder="Or paste direct image URL..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    {(itemFile || itemImageUrl) && (
                      <div className="mt-2 text-xs text-indigo-400 flex items-center gap-2">
                        <span>📸 Preview ready</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={itemUploading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {itemUploading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Uploading Image...</span>
                      </>
                    ) : (
                      <span>{editingItemId ? "Save Changes" : "Create Item"}</span>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Item Gallery ({items.length})</h2>
                <button
                  onClick={fetchItems}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>🔄 Refresh</span>
                </button>
              </div>

              {itemLoading ? (
                <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <span>Loading items from PostgreSQL...</span>
                </div>
              ) : items.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 space-y-2">
                  <p className="text-2xl">📦</p>
                  <p className="text-base text-slate-300 font-medium">No items yet</p>
                  <p className="text-xs">Add your first item using the form on the left.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg"
                    >
                      {item.image_url && (
                        <div className="h-44 w-full bg-slate-950 relative overflow-hidden border-b border-slate-800/80">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-white text-base leading-snug">{item.title}</h3>
                            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                              #{item.id}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-500/20 hover:bg-rose-900/60 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: POSTS & COMMUNITY FEED (Posts + Comments)          */}
        {/* ========================================================= */}
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Create / Edit Post Form */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{editingPostId ? "✏️" : "💬"}</span>
                    <span>{editingPostId ? "Edit Post" : "Write a Post"}</span>
                  </h2>
                  {editingPostId && (
                    <button
                      onClick={resetPostForm}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handlePostSubmit} className="space-y-4">
                  {!editingPostId && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Author *
                      </label>
                      {users.length === 0 ? (
                        <p className="text-xs text-amber-400 bg-amber-950/30 border border-amber-500/30 p-2 rounded-lg">
                          ⚠️ Please create at least one User first in the Users tab.
                        </p>
                      ) : (
                        <select
                          value={postUserId}
                          onChange={(e) => setPostUserId(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                          required
                        >
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.email})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Post Title *
                    </label>
                    <input
                      type="text"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="What is this post about?"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Content
                    </label>
                    <textarea
                      rows={4}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPostFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 file:cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={postUploading || (!editingPostId && users.length === 0)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {postUploading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Uploading Image...</span>
                      </>
                    ) : (
                      <span>{editingPostId ? "Save Post" : "Publish Post"}</span>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="lg:col-span-8 space-y-6">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Filter by Author:</span>
                  <select
                    value={selectedUserFilter}
                    onChange={(e) => {
                      const val = e.target.value === "all" ? "all" : Number(e.target.value);
                      setSelectedUserFilter(val);
                      fetchPosts(val);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Users ({posts.length})</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => fetchPosts(selectedUserFilter)}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  🔄 Refresh Feed
                </button>
              </div>

              {postLoading ? (
                <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <span>Loading feed...</span>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 space-y-2">
                  <p className="text-2xl">📝</p>
                  <p className="text-base text-slate-300 font-medium">No posts found</p>
                  <p className="text-xs">Publish a post from the form to start the conversation.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700/80 transition-all"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
                            {getUserName(post.user_id).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-sm">{getUserName(post.user_id)}</h3>
                            <p className="text-[11px] text-slate-500">
                              {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-500/20 hover:bg-rose-900/60 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Post Body */}
                      <div className="space-y-3">
                        <h4 className="text-base font-bold text-slate-100">{post.title}</h4>
                        {post.content && (
                          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {post.content}
                          </p>
                        )}
                        {post.image_url && (
                          <div className="rounded-xl overflow-hidden border border-slate-800 max-h-96 bg-slate-950">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.image_url}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Post Footer & Comments Section */}
                      <div className="pt-4 border-t border-slate-800/80 space-y-4">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => togglePostComments(post.id)}
                            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                          >
                            <span>💬</span>
                            <span>
                              {expandedComments[post.id]
                                ? "Hide Comments"
                                : `View Comments (${commentsByPost[post.id]?.length ?? "..."})`}
                            </span>
                          </button>
                        </div>

                        {/* Comments Drawer */}
                        {expandedComments[post.id] && (
                          <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 space-y-4">
                            {/* List of Comments */}
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                              {(commentsByPost[post.id] || []).length === 0 ? (
                                <p className="text-xs text-slate-500 italic py-2">
                                  No comments yet. Be the first to leave one!
                                </p>
                              ) : (
                                commentsByPost[post.id].map((c) => (
                                  <div
                                    key={c.id}
                                    className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3 text-xs flex items-start justify-between gap-3"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-indigo-300">
                                          {getUserName(c.user_id)}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                          {c.created_at ? new Date(c.created_at).toLocaleTimeString() : ""}
                                        </span>
                                      </div>
                                      <p className="text-slate-200">{c.message}</p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteComment(c.id, post.id)}
                                      className="text-slate-500 hover:text-rose-400 text-xs px-1"
                                      title="Delete comment"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Add Comment Form */}
                            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800/80">
                              <select
                                value={commentUser[post.id] ?? (users[0]?.id || "")}
                                onChange={(e) =>
                                  setCommentUser((prev) => ({
                                    ...prev,
                                    [post.id]: Number(e.target.value),
                                  }))
                                }
                                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none sm:w-40"
                              >
                                {users.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name}
                                  </option>
                                ))}
                              </select>

                              <input
                                type="text"
                                value={commentText[post.id] || ""}
                                onChange={(e) =>
                                  setCommentText((prev) => ({
                                    ...prev,
                                    [post.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleAddComment(post.id);
                                }}
                                placeholder="Write a comment..."
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                              />

                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: USERS (Create, List, Manage Users)                 */}
        {/* ========================================================= */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* User Form */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{editingUserId ? "✏️" : "👤"}</span>
                    <span>{editingUserId ? "Edit User" : "Add New User"}</span>
                  </h2>
                  {editingUserId && (
                    <button
                      onClick={resetUserForm}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {!editingUserId && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm"
                  >
                    {editingUserId ? "Update User" : "Create User"}
                  </button>
                </form>
              </div>
            </div>

            {/* Users List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Registered Users ({users.length})</h2>
                <button
                  onClick={fetchUsers}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  🔄 Refresh Users
                </button>
              </div>

              {userLoading ? (
                <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <span>Loading users...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 space-y-2">
                  <p className="text-2xl">👥</p>
                  <p className="text-base text-slate-300 font-medium">No users created</p>
                  <p className="text-xs">Create your first user to start posting and commenting.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-white text-sm truncate">{user.name}</h3>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          <span className="text-[10px] text-slate-500 font-mono">ID: #{user.id}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedUserFilter(user.id);
                            setActiveTab("posts");
                            fetchPosts(user.id);
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          View Posts →
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-500/20 hover:bg-rose-900/60 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>PERN Stack App (PostgreSQL • Express • React 19 • Next.js 16 • Tailwind CSS v4)</p>
      </footer>
    </div>
  );
}
