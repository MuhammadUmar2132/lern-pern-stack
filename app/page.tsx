"use client";

import { useState, useEffect } from "react";

interface Item {
  id: number;
  title: string;
  description: string;
  image_url?: string | null;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const API_URL = "http://localhost:5000/api/items";

  const fetchItems = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const uploadImage = async () => {
    if (!selectedFile) return imageUrl;

    const formData = new FormData();
    formData.append("image", selectedFile);

    setUploading(true);
    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setImageUrl(data.url);
      setSelectedFile(null);
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      return imageUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const uploadedImage = await uploadImage();

      if (editingId) {
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, imageUrl: uploadedImage }),
        });
        if (res.ok) {
          setEditingId(null);
          setTitle("");
          setDescription("");
          setImageUrl("");
          setSelectedFile(null);
          fetchItems();
        }
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, imageUrl: uploadedImage }),
        });
        if (res.ok) {
          setTitle("");
          setDescription("");
          setImageUrl("");
          setSelectedFile(null);
          fetchItems();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setImageUrl(item.image_url || "");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            CRUD App
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            A simple full-stack CRUD with Next.js, Express, PostgreSQL, and Cloudinary uploads
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {editingId ? "Edit Item" : "Add New Item"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 bg-gray-50 border outline-none transition-all"
                placeholder="Enter item title..."
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 bg-gray-50 border outline-none transition-all resize-none"
                placeholder="Enter description..."
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Image
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {selectedFile && (
                <p className="mt-2 text-xs text-gray-500">
                  Selected: {selectedFile.name}
                </p>
              )}
              {imageUrl && !selectedFile && (
                <img src={imageUrl} alt="Selected preview" className="mt-3 h-32 w-auto rounded-lg object-cover border" />
              )}
            </div>

            <div className="flex justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle("");
                    setDescription("");
                    setImageUrl("");
                    setSelectedFile(null);
                  }}
                  className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-60"
              >
                {uploading ? "Uploading..." : editingId ? "Update Item" : "Create Item"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Item List</h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <li className="px-6 py-12 text-center text-gray-500">
                No items found. Add one above!
              </li>
            ) : (
              items.map((item) => (
                <li
                  key={item.id}
                  className="px-6 py-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="h-20 w-20 rounded-lg object-cover border" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">{item.title}</p>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
