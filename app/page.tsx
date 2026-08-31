"use client";

import { useState, useEffect, useCallback } from "react";
import { Item, User, Post, TabType, ToastNotification } from "@/types";
import {
  itemsService,
  usersService,
  postsService,
  checkBackendHealth,
} from "@/services";

import { Navbar } from "@/components/layout/Navbar";
import { TabsNav } from "@/components/layout/TabsNav";
import { Footer } from "@/components/layout/Footer";
import { NotificationToast } from "@/components/ui/NotificationToast";

import { ItemsTab } from "@/components/items/ItemsTab";
import { PostsTab } from "@/components/posts/PostsTab";
import { UsersTab } from "@/components/users/UsersTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("items");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Entities state
  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [selectedUserFilter, setSelectedUserFilter] = useState<number | "all">("all");

  // Notifications
  const [notification, setNotification] = useState<ToastNotification | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    const id = Date.now().toString();
    setNotification({ id, message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.id === id ? null : prev));
    }, 4000);
  };

  // Health check
  const refreshHealth = useCallback(async () => {
    const isOnline = await checkBackendHealth();
    setBackendOnline(isOnline);
  }, []);

  // Fetch Items
  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    const res = await itemsService.getAll();
    if (res.success && Array.isArray(res.data)) {
      setItems(res.data);
    }
    setItemsLoading(false);
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    const res = await usersService.getAll();
    if (res.success && Array.isArray(res.data)) {
      setUsers(res.data);
    }
    setUsersLoading(false);
  }, []);

  // Fetch Posts
  const fetchPosts = useCallback(async (filter: number | "all" = selectedUserFilter) => {
    setPostsLoading(true);
    const res =
      filter !== "all"
        ? await postsService.getByUserId(filter)
        : await postsService.getAll();

    if (res.success && Array.isArray(res.data)) {
      setPosts(res.data);
    }
    setPostsLoading(false);
  }, [selectedUserFilter]);

  // Initial Load
  useEffect(() => {
    refreshHealth();
    fetchItems();
    fetchUsers();
    fetchPosts("all");
  }, [refreshHealth, fetchItems, fetchUsers, fetchPosts]);

  // Handlers
  const handleFilterUser = (userId: number | "all") => {
    setSelectedUserFilter(userId);
    fetchPosts(userId);
  };

  const handleViewUserPosts = (userId: number) => {
    setSelectedUserFilter(userId);
    setActiveTab("posts");
    fetchPosts(userId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Feedback */}
      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Header / Navbar */}
      <Navbar
        backendOnline={backendOnline}
        onRefreshHealth={refreshHealth}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Navigation Tabs */}
        <TabsNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          itemsCount={items.length}
          postsCount={posts.length}
          usersCount={users.length}
        />

        {/* Tab Views */}
        {activeTab === "items" && (
          <ItemsTab
            items={items}
            loading={itemsLoading}
            onRefresh={fetchItems}
            onNotify={showNotification}
          />
        )}

        {activeTab === "posts" && (
          <PostsTab
            posts={posts}
            users={users}
            loading={postsLoading}
            selectedUserFilter={selectedUserFilter}
            onFilterUser={handleFilterUser}
            onRefreshPosts={() => fetchPosts(selectedUserFilter)}
            onNotify={showNotification}
          />
        )}

        {activeTab === "users" && (
          <UsersTab
            users={users}
            loading={usersLoading}
            onRefresh={() => {
              fetchUsers();
              fetchPosts(selectedUserFilter);
            }}
            onNotify={showNotification}
            onViewUserPosts={handleViewUserPosts}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
