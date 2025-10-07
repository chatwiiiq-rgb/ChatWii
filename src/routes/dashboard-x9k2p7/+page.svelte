<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/authStore';
  import ThemeToggle from '$lib/components/shared/ThemeToggle.svelte';
  import { supabase } from '$lib/supabase';
  import type { RealtimeChannel } from '@supabase/supabase-js';

  interface Feedback {
    id: string;
    email: string | null;
    message: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
  }

  interface Report {
    id: string;
    reason: string;
    details: string;
    status: string;
    created_at: string;
    reviewed_at: string | null;
    admin_notes: string | null;
    reporter: {
      id: string;
      nickname: string;
      gender: string;
      age: number;
      country: string;
    };
    reported: {
      id: string;
      nickname: string;
      gender: string;
      age: number;
      country: string;
      status: string;
      banned_at: string | null;
      ban_reason: string | null;
    };
  }

  interface User {
    id: string;
    nickname: string;
    gender: string;
    age: number;
    country: string;
    status: string;
    role: string;
    last_seen: string;
    created_at: string;
    banned_at: string | null;
    ban_reason: string | null;
    message_count: number;
  }

  // Tab management
  let activeTab: 'analytics' | 'feedback' | 'reports' | 'users' | 'settings' = 'analytics';

  let feedbacks: Feedback[] = [];
  let reports: Report[] = [];
  let users: User[] = [];
  let analytics: any = null;
  let analyticsTimeRange = '30'; // days
  let settings: any = null;
  let settingsChanged = false;
  let totalUsers = 0;
  let realOnlineCount = 0; // Real-time online count from presence
  let presenceChannel: RealtimeChannel | null = null;
  let isLoading = true;
  let error = '';
  let currentUser: any = null;

  // Pagination for feedback
  let currentPage = 1;
  let itemsPerPage = 20;
  $: totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  $: paginatedFeedbacks = filteredFeedbacks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Pagination for reports
  let reportsCurrentPage = 1;
  let reportsItemsPerPage = 20;
  $: reportsTotalPages = Math.ceil(filteredReports.length / reportsItemsPerPage);
  $: paginatedReports = filteredReports.slice((reportsCurrentPage - 1) * reportsItemsPerPage, reportsCurrentPage * reportsItemsPerPage);

  // Pagination for users
  let usersCurrentPage = 1;
  let usersItemsPerPage = 20;
  $: usersTotalPages = Math.ceil(filteredUsers.length / usersItemsPerPage);
  $: paginatedUsers = filteredUsers.slice((usersCurrentPage - 1) * usersItemsPerPage, usersCurrentPage * usersItemsPerPage);

  // Filters for feedback
  let searchQuery = '';
  let showWithEmailOnly = false;

  $: filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = !searchQuery ||
      f.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEmailFilter = !showWithEmailOnly || f.email;
    return matchesSearch && matchesEmailFilter;
  });

  // Filters for reports
  let reportsSearchQuery = '';
  let reportsStatusFilter: string = 'all';

  $: filteredReports = reports.filter(r => {
    const matchesSearch = !reportsSearchQuery ||
      r.reporter.nickname.toLowerCase().includes(reportsSearchQuery.toLowerCase()) ||
      r.reported.nickname.toLowerCase().includes(reportsSearchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(reportsSearchQuery.toLowerCase());
    const matchesStatus = reportsStatusFilter === 'all' || r.status === reportsStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filters for users
  let usersSearchQuery = '';
  let usersStatusFilter: string = 'all';
  let usersSortBy: string = 'created_at';
  let usersSortOrder: 'asc' | 'desc' = 'desc';

  $: filteredUsers = users.filter(u => {
    const matchesSearch = !usersSearchQuery ||
      u.nickname.toLowerCase().includes(usersSearchQuery.toLowerCase()) ||
      u.country.toLowerCase().includes(usersSearchQuery.toLowerCase());
    const matchesStatus = usersStatusFilter === 'all' || u.status === usersStatusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const aVal = a[usersSortBy as keyof User];
    const bVal = b[usersSortBy as keyof User];
    if (usersSortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Delete user modal
  let showDeleteUserModal = false;
  let deleteUserId = '';
  let deleteUserNickname = '';
  let deleteUserLoading = false;

  // Ban modal
  let showBanModal = false;
  let banUserId = '';
  let banUserNickname = '';
  let banReason = '';
  let banLoading = false;

  onMount(async () => {
    // Subscribe to presence channel to get real-time online count
    subscribeToPresence();

    if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'feedback') {
      loadFeedback();
    } else if (activeTab === 'reports') {
      loadReports();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'settings') {
      loadSettings();
    }
  });

  onDestroy(() => {
    // Cleanup presence subscription
    if (presenceChannel) {
      presenceChannel.unsubscribe();
      presenceChannel = null;
    }
  });

  function subscribeToPresence() {
    // Subscribe to the same presence channel that chat uses
    presenceChannel = supabase.channel('online-users');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        if (presenceChannel) {
          const state = presenceChannel.presenceState();
          realOnlineCount = Object.keys(state).length;
        }
      })
      .on('presence', { event: 'join' }, () => {
        if (presenceChannel) {
          const state = presenceChannel.presenceState();
          realOnlineCount = Object.keys(state).length;
        }
      })
      .on('presence', { event: 'leave' }, () => {
        if (presenceChannel) {
          const state = presenceChannel.presenceState();
          realOnlineCount = Object.keys(state).length;
        }
      })
      .subscribe();
  }

  function switchTab(tab: 'analytics' | 'feedback' | 'reports' | 'users' | 'settings') {
    activeTab = tab;
    currentPage = 1;
    reportsCurrentPage = 1;
    usersCurrentPage = 1;
    if (tab === 'analytics') {
      loadAnalytics();
    } else if (tab === 'feedback') {
      loadFeedback();
    } else if (tab === 'reports') {
      loadReports();
    } else if (tab === 'users') {
      loadUsers();
    } else if (tab === 'settings') {
      loadSettings();
    }
  }

  async function loadAnalytics() {
    isLoading = true;
    error = '';

    try {
      const response = await fetch(`/api/admin/analytics?range=${analyticsTimeRange}`);
      const data = await response.json();

      if (!response.ok) {
        error = data.error || 'Failed to load analytics';
        return;
      }

      analytics = data.analytics;
    } catch (err) {
      error = 'An error occurred while loading analytics';
      console.error('Load analytics error:', err);
    } finally {
      isLoading = false;
    }
  }

  async function loadSettings() {
    isLoading = true;
    error = '';

    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();

      if (!response.ok) {
        error = data.error || 'Failed to load settings';
        return;
      }

      settings = data.settings;
      settingsChanged = false;
    } catch (err) {
      error = 'An error occurred while loading settings';
      console.error('Load settings error:', err);
    } finally {
      isLoading = false;
    }
  }

  async function updateSetting(key: string, value: any) {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setting_key: key, setting_value: value })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to update setting: ${data.error}`);
        return;
      }

      settingsChanged = true;
      // Reload to get updated timestamp
      await loadSettings();
    } catch (err) {
      console.error('Update setting error:', err);
      alert('Failed to update setting');
    }
  }

  async function resetAllSettings() {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to reset settings: ${data.error}`);
        return;
      }

      alert('All settings have been reset to defaults');
      await loadSettings();
    } catch (err) {
      console.error('Reset settings error:', err);
      alert('Failed to reset settings');
    }
  }

  async function loadFeedback() {
    isLoading = true;
    error = '';

    try {
      const response = await fetch('/api/admin/feedback');
      const data = await response.json();

      if (!response.ok) {
        error = data.error || 'Failed to load feedback';
        return;
      }

      feedbacks = data.feedbacks || [];
    } catch (err) {
      error = 'An error occurred while loading feedback';
      console.error('Load feedback error:', err);
    } finally {
      isLoading = false;
    }
  }

  async function loadReports() {
    console.log('[Reports] Starting to load reports...');
    isLoading = true;
    error = '';

    try {
      console.log('[Reports] Fetching from /api/admin/reports');
      const response = await fetch('/api/admin/reports');
      console.log('[Reports] Got response:', response.status, response.ok);

      const data = await response.json();
      console.log('[Reports] Got data:', data);

      if (!response.ok) {
        error = data.error || 'Failed to load reports';
        console.error('[Reports] Response not OK:', error);
        return;
      }

      reports = data.reports || [];
      console.log('[Reports] Successfully loaded', reports.length, 'reports');
    } catch (err) {
      error = 'An error occurred while loading reports';
      console.error('[Reports] Load reports error:', err);
    } finally {
      console.log('[Reports] Setting isLoading = false');
      isLoading = false;
    }
  }

  async function deleteFeedback(id: string) {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        feedbacks = feedbacks.filter(f => f.id !== id);
      } else {
        alert('Failed to delete feedback');
      }
    } catch (err) {
      alert('An error occurred while deleting feedback');
      console.error('Delete error:', err);
    }
  }

  async function updateReportStatus(reportId: string, status: string, notes: string = '') {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: notes })
      });

      if (response.ok) {
        loadReports();
      } else {
        alert('Failed to update report');
      }
    } catch (err) {
      alert('An error occurred while updating report');
      console.error('Update report error:', err);
    }
  }

  async function deleteReport(id: string) {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`/api/admin/reports/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        reports = reports.filter(r => r.id !== id);
      } else {
        alert('Failed to delete report');
      }
    } catch (err) {
      alert('An error occurred while deleting report');
      console.error('Delete report error:', err);
    }
  }

  function openBanModal(userId: string, nickname: string) {
    banUserId = userId;
    banUserNickname = nickname;
    banReason = '';
    showBanModal = true;
  }

  async function handleBan() {
    if (!banReason.trim()) {
      alert('Please enter a ban reason');
      return;
    }

    banLoading = true;
    try {
      const response = await fetch(`/api/admin/users/${banUserId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: banReason })
      });

      if (response.ok) {
        showBanModal = false;
        if (activeTab === 'reports') {
          loadReports();
        } else if (activeTab === 'users') {
          loadUsers();
        }
        alert('User banned successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to ban user');
      }
    } catch (err) {
      alert('An error occurred while banning user');
      console.error('Ban user error:', err);
    } finally {
      banLoading = false;
    }
  }

  async function unbanUser(userId: string, reloadFrom: 'reports' | 'users' = 'reports') {
    if (!confirm('Are you sure you want to unban this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'POST',
      });

      if (response.ok) {
        if (reloadFrom === 'reports') {
          loadReports();
        } else {
          loadUsers();
        }
        alert('User unbanned successfully');
      } else {
        alert('Failed to unban user');
      }
    } catch (err) {
      alert('An error occurred while unbanning user');
      console.error('Unban user error:', err);
    }
  }

  async function loadUsers() {
    isLoading = true;
    error = '';

    try {
      const params = new URLSearchParams({
        search: usersSearchQuery,
        status: usersStatusFilter,
        sortBy: usersSortBy,
        sortOrder: usersSortOrder
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        error = data.error || 'Failed to load users';
        return;
      }

      users = data.users || [];
      totalUsers = data.total || users.length;
    } catch (err) {
      error = 'An error occurred while loading users';
      console.error('Load users error:', err);
    } finally {
      isLoading = false;
    }
  }

  function openDeleteUserModal(userId: string, nickname: string) {
    deleteUserId = userId;
    deleteUserNickname = nickname;
    showDeleteUserModal = true;
  }

  async function handleDeleteUser() {
    deleteUserLoading = true;
    try {
      const response = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showDeleteUserModal = false;
        loadUsers();
        alert('User deleted successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('An error occurred while deleting user');
      console.error('Delete user error:', err);
    } finally {
      deleteUserLoading = false;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }

  function getStatusColor(status: string) {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400';
      case 'reviewed': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
    }
  }
</script>

<svelte:head>
  <title>Admin Dashboard - ChatWii</title>
</svelte:head>

<div class="min-h-screen bg-neutral-100 dark:bg-neutral-900">
  <!-- Header -->
  <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 h-16 px-6 flex items-center justify-between sticky top-0 z-10">
    <div class="flex items-center gap-4">
      <a href="/" class="flex items-center gap-3">
        <img src="/logo/logo.png" alt="ChatWii" class="h-10 w-auto" />
      </a>
      <span class="text-2xl font-bold text-neutral-900 dark:text-white">Admin Dashboard</span>
    </div>
    <div class="flex items-center gap-4">
      <button
        on:click={() => activeTab === 'analytics' ? loadAnalytics() : activeTab === 'feedback' ? loadFeedback() : activeTab === 'reports' ? loadReports() : activeTab === 'users' ? loadUsers() : loadSettings()}
        class="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm font-medium"
      >
        Refresh
      </button>
      <ThemeToggle />
    </div>
  </header>

  <!-- Tabs -->
  <div class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-16 z-10">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex gap-1">
        <button
          on:click={() => switchTab('analytics')}
          class="px-6 py-3 font-medium transition-colors border-b-2 {activeTab === 'analytics' ? 'text-secondary-500 border-secondary-500' : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-white'}"
        >
          Analytics
        </button>
        <button
          on:click={() => switchTab('feedback')}
          class="px-6 py-3 font-medium transition-colors border-b-2 {activeTab === 'feedback' ? 'text-secondary-500 border-secondary-500' : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-white'}"
        >
          Feedback
        </button>
        <button
          on:click={() => switchTab('reports')}
          class="px-6 py-3 font-medium transition-colors border-b-2 {activeTab === 'reports' ? 'text-secondary-500 border-secondary-500' : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-white'}"
        >
          Reports
          {#if reports.filter(r => r.status === 'pending').length > 0}
            <span class="ml-2 px-2 py-0.5 text-xs bg-danger-500 text-white rounded-full">
              {reports.filter(r => r.status === 'pending').length}
            </span>
          {/if}
        </button>
        <button
          on:click={() => switchTab('users')}
          class="px-6 py-3 font-medium transition-colors border-b-2 {activeTab === 'users' ? 'text-secondary-500 border-secondary-500' : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-white'}"
        >
          Users
          <span class="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
            ({totalUsers})
          </span>
        </button>
        <button
          on:click={() => switchTab('settings')}
          class="px-6 py-3 font-medium transition-colors border-b-2 {activeTab === 'settings' ? 'text-secondary-500 border-secondary-500' : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-white'}"
        >
          Settings
        </button>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 py-8">
    {#if activeTab === 'analytics'}
    <!-- Analytics Content -->
    {#if isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    {:else if analytics}
      <!-- Time Range Selector -->
      <div class="mb-6 flex justify-end">
        <select
          bind:value={analyticsTimeRange}
          on:change={() => loadAnalytics()}
          class="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <!-- Key Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Users -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm text-neutral-600 dark:text-neutral-400">Total Users</div>
            <svg class="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div class="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {analytics.overview.totalUsers.toLocaleString()}
          </div>
          {#if analytics.overview.usersLast7Days !== undefined}
            <div class="text-xs text-neutral-500 dark:text-neutral-400">
              +{analytics.overview.usersLast7Days} this week
              {#if analytics.overview.usersPrevious7Days > 0}
                <span class="text-green-600 dark:text-green-400">
                  ({Math.round((analytics.overview.usersLast7Days / analytics.overview.usersPrevious7Days - 1) * 100)}%)
                </span>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Total Messages -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm text-neutral-600 dark:text-neutral-400">Total Messages</div>
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <div class="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {analytics.overview.totalMessages.toLocaleString()}
          </div>
          {#if analytics.overview.messagesLast7Days !== undefined}
            <div class="text-xs text-neutral-500 dark:text-neutral-400">
              +{analytics.overview.messagesLast7Days.toLocaleString()} this week
            </div>
          {/if}
        </div>

        <!-- Total Reports -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm text-neutral-600 dark:text-neutral-400">Total Reports</div>
            <svg class="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div class="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {analytics.overview.totalReports.toLocaleString()}
          </div>
          <div class="text-xs text-neutral-500 dark:text-neutral-400">
            {analytics.reports.byStatus.pending || 0} pending
          </div>
        </div>

        <!-- Banned Users -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm text-neutral-600 dark:text-neutral-400">Banned Users</div>
            <svg class="w-5 h-5 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
            </svg>
          </div>
          <div class="text-3xl font-bold text-danger-600 dark:text-danger-400 mb-2">
            {analytics.overview.bannedUsers.toLocaleString()}
          </div>
          <div class="text-xs text-neutral-500 dark:text-neutral-400">
            {((analytics.overview.bannedUsers / analytics.overview.totalUsers) * 100).toFixed(1)}% of total
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- User Registrations Chart -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">User Registrations</h3>
          <div class="space-y-2">
            {#each Object.entries(analytics.timeSeries.registrationsByDate).slice(-10) as [date, count]}
              <div class="flex items-center gap-3">
                <div class="text-sm text-neutral-600 dark:text-neutral-400 w-24">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div class="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-6 relative overflow-hidden">
                  <div
                    class="bg-secondary-500 h-full rounded-full flex items-center justify-end px-2"
                    style="width: {Math.max(5, (count / Math.max(...Object.values(analytics.timeSeries.registrationsByDate))) * 100)}%"
                  >
                    <span class="text-xs font-medium text-white">{count}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Message Activity Chart -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Message Activity</h3>
          <div class="space-y-2">
            {#each Object.entries(analytics.timeSeries.messagesByDate).slice(-10) as [date, count]}
              <div class="flex items-center gap-3">
                <div class="text-sm text-neutral-600 dark:text-neutral-400 w-24">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div class="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-6 relative overflow-hidden">
                  <div
                    class="bg-blue-500 h-full rounded-full flex items-center justify-end px-2"
                    style="width: {Math.max(5, (count / Math.max(...Object.values(analytics.timeSeries.messagesByDate))) * 100)}%"
                  >
                    <span class="text-xs font-medium text-white">{count}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Demographics Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Gender Distribution -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Gender Distribution</h3>
          <div class="space-y-3">
            {#each Object.entries(analytics.demographics.genderDistribution) as [gender, count]}
              <div>
                <div class="flex items-center justify-between text-sm mb-1">
                  <span class="capitalize text-neutral-700 dark:text-neutral-300">{gender}</span>
                  <span class="font-medium text-neutral-900 dark:text-white">
                    {count} ({((count / analytics.overview.totalUsers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    class="bg-secondary-500 h-full rounded-full"
                    style="width: {(count / analytics.overview.totalUsers) * 100}%"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Age Distribution -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Age Distribution</h3>
          <div class="space-y-3">
            {#each Object.entries(analytics.demographics.ageDistribution) as [range, count]}
              <div>
                <div class="flex items-center justify-between text-sm mb-1">
                  <span class="text-neutral-700 dark:text-neutral-300">{range}</span>
                  <span class="font-medium text-neutral-900 dark:text-white">
                    {count} ({((count / analytics.overview.totalUsers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    class="bg-blue-500 h-full rounded-full"
                    style="width: {(count / analytics.overview.totalUsers) * 100}%"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Top Countries -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Top Countries</h3>
          <div class="space-y-3">
            {#each Object.entries(analytics.demographics.countryDistribution).sort((a, b) => b[1] - a[1]).slice(0, 5) as [country, count]}
              <div>
                <div class="flex items-center justify-between text-sm mb-1">
                  <span class="text-neutral-700 dark:text-neutral-300">{country}</span>
                  <span class="font-medium text-neutral-900 dark:text-white">
                    {count} ({((count / analytics.overview.totalUsers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    class="bg-green-500 h-full rounded-full"
                    style="width: {(count / analytics.overview.totalUsers) * 100}%"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Report Statistics -->
      {#if Object.keys(analytics.reports.byReason).length > 0}
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Report Reasons</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each Object.entries(analytics.reports.byReason) as [reason, count]}
            <div class="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
              <div class="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{count}</div>
              <div class="text-sm text-neutral-600 dark:text-neutral-400 capitalize">{reason.replace(/_/g, ' ')}</div>
            </div>
          {/each}
        </div>
      </div>
      {/if}
    {/if}

    {:else if activeTab === 'feedback'}
    <!-- Feedback Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Feedback</div>
        <div class="text-3xl font-bold text-neutral-900 dark:text-white">{feedbacks.length}</div>
      </div>
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">With Email</div>
        <div class="text-3xl font-bold text-neutral-900 dark:text-white">
          {feedbacks.filter(f => f.email).length}
        </div>
      </div>
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Anonymous</div>
        <div class="text-3xl font-bold text-neutral-900 dark:text-white">
          {feedbacks.filter(f => !f.email).length}
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search feedback..."
            class="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary-500"
          />
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={showWithEmailOnly}
            class="w-4 h-4 text-secondary-500 rounded focus:ring-2 focus:ring-secondary-500"
          />
          <span class="text-sm text-neutral-700 dark:text-neutral-300">Show only with email</span>
        </label>
      </div>
    </div>

    <!-- Feedback List -->
    {#if isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    {:else if error}
      <div class="bg-danger-100 dark:bg-danger-500/20 border border-danger-500 rounded-lg p-6 text-center">
        <p class="text-danger-700 dark:text-danger-400">{error}</p>
      </div>
    {:else if filteredFeedbacks.length === 0}
      <div class="bg-neutral-200 dark:bg-neutral-800 rounded-xl p-12 text-center border border-neutral-300 dark:border-neutral-700">
        <p class="text-neutral-600 dark:text-neutral-400 text-lg">No feedback found</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each paginatedFeedbacks as feedback (feedback.id)}
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 hover:border-secondary-500 transition-colors">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  {#if feedback.email}
                    <span class="text-sm font-medium text-neutral-900 dark:text-white">
                      {feedback.email}
                    </span>
                    <button
                      on:click={() => copyToClipboard(feedback.email || '')}
                      class="text-xs text-secondary-500 hover:text-secondary-600"
                    >
                      Copy
                    </button>
                  {:else}
                    <span class="text-sm text-neutral-500 dark:text-neutral-400 italic">Anonymous</span>
                  {/if}
                  <span class="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDate(feedback.created_at)}
                  </span>
                </div>
                <p class="text-neutral-900 dark:text-white whitespace-pre-wrap">{feedback.message}</p>
              </div>
              <button
                on:click={() => deleteFeedback(feedback.id)}
                class="ml-4 p-2 text-danger-500 hover:bg-danger-100 dark:hover:bg-danger-500/20 rounded-lg transition-colors"
                title="Delete feedback"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div class="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              <span>IP: {feedback.ip_address}</span>
              <span class="truncate max-w-md">UA: {feedback.user_agent}</span>
            </div>
          </div>
        {/each}
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="flex items-center justify-center gap-2 mt-8">
          <button
            on:click={() => currentPage = Math.max(1, currentPage - 1)}
            disabled={currentPage === 1}
            class="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span class="text-neutral-700 dark:text-neutral-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
            disabled={currentPage === totalPages}
            class="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      {/if}
    {/if}

    {:else if activeTab === 'reports'}
    <!-- Reports Section -->
    <!-- Reports Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Reports</div>
        <div class="text-3xl font-bold text-neutral-900 dark:text-white">{reports.length}</div>
      </div>
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Pending</div>
        <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
          {reports.filter(r => r.status === 'pending').length}
        </div>
      </div>
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Reviewed</div>
        <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {reports.filter(r => r.status === 'reviewed').length}
        </div>
      </div>
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Resolved</div>
        <div class="text-3xl font-bold text-green-600 dark:text-green-400">
          {reports.filter(r => r.status === 'resolved').length}
        </div>
      </div>
    </div>

    <!-- Reports Filters -->
    <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            type="text"
            bind:value={reportsSearchQuery}
            placeholder="Search reports by user or reason..."
            class="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary-500"
          />
        </div>
        <select
          bind:value={reportsStatusFilter}
          class="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
    </div>

    <!-- Reports List -->
    {#if isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    {:else if error}
      <div class="bg-danger-100 dark:bg-danger-500/20 border border-danger-500 rounded-lg p-6 text-center">
        <p class="text-danger-700 dark:text-danger-400">{error}</p>
      </div>
    {:else if filteredReports.length === 0}
      <div class="bg-neutral-200 dark:bg-neutral-800 rounded-xl p-12 text-center border border-neutral-300 dark:border-neutral-700">
        <p class="text-neutral-600 dark:text-neutral-400 text-lg">No reports found</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each paginatedReports as report (report.id)}
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <!-- Report Header -->
                <div class="flex items-center gap-3 mb-3">
                  <span class="px-3 py-1 text-xs font-medium rounded-full {getStatusColor(report.status)}">
                    {report.status.toUpperCase()}
                  </span>
                  <span class="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDate(report.created_at)}
                  </span>
                </div>

                <!-- Reporter & Reported -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div class="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3">
                    <div class="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Reporter</div>
                    <div class="font-medium text-neutral-900 dark:text-white">
                      {report.reporter.nickname}
                    </div>
                    <div class="text-sm text-neutral-600 dark:text-neutral-400">
                      {report.reporter.gender}, {report.reporter.age}, {report.reporter.country}
                    </div>
                  </div>
                  <div class="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3">
                    <div class="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Reported User</div>
                    <div class="font-medium text-neutral-900 dark:text-white">
                      {report.reported.nickname}
                      {#if report.reported.status === 'banned'}
                        <span class="ml-2 px-2 py-0.5 text-xs bg-danger-500 text-white rounded">BANNED</span>
                      {/if}
                    </div>
                    <div class="text-sm text-neutral-600 dark:text-neutral-400">
                      {report.reported.gender}, {report.reported.age}, {report.reported.country}
                    </div>
                  </div>
                </div>

                <!-- Report Details -->
                <div class="mb-3">
                  <div class="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Reason: <span class="text-neutral-900 dark:text-white">{report.reason}</span>
                  </div>
                  {#if report.details}
                    <div class="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                      {report.details}
                    </div>
                  {/if}
                </div>

                <!-- Ban Info -->
                {#if report.reported.status === 'banned' && report.reported.ban_reason}
                  <div class="bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 rounded-lg p-3 mb-3">
                    <div class="text-sm font-medium text-danger-700 dark:text-danger-400 mb-1">Ban Reason:</div>
                    <div class="text-sm text-danger-600 dark:text-danger-300">{report.reported.ban_reason}</div>
                    {#if report.reported.banned_at}
                      <div class="text-xs text-danger-500 dark:text-danger-400 mt-1">
                        Banned: {formatDate(report.reported.banned_at)}
                      </div>
                    {/if}
                  </div>
                {/if}

                <!-- Admin Notes -->
                {#if report.admin_notes}
                  <div class="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-3 mb-3">
                    <div class="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Admin Notes:</div>
                    <div class="text-sm text-blue-600 dark:text-blue-300">{report.admin_notes}</div>
                  </div>
                {/if}
              </div>

              <!-- Action Buttons -->
              <div class="ml-4 flex flex-col gap-2">
                {#if report.reported.status !== 'banned'}
                  <button
                    on:click={() => openBanModal(report.reported.id, report.reported.nickname)}
                    class="px-3 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Ban User
                  </button>
                {:else}
                  <button
                    on:click={() => unbanUser(report.reported.id)}
                    class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Unban User
                  </button>
                {/if}

                {#if report.status === 'pending'}
                  <button
                    on:click={() => updateReportStatus(report.id, 'reviewed')}
                    class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Mark Reviewed
                  </button>
                {/if}

                {#if report.status !== 'resolved'}
                  <button
                    on:click={() => updateReportStatus(report.id, 'resolved')}
                    class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Mark Resolved
                  </button>
                {/if}

                <button
                  on:click={() => deleteReport(report.id)}
                  class="px-3 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Reports Pagination -->
      {#if reportsTotalPages > 1}
        <div class="flex items-center justify-center gap-2 mt-8">
          <button
            on:click={() => reportsCurrentPage = Math.max(1, reportsCurrentPage - 1)}
            disabled={reportsCurrentPage === 1}
            class="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span class="text-neutral-700 dark:text-neutral-300">
            Page {reportsCurrentPage} of {reportsTotalPages}
          </span>
          <button
            on:click={() => reportsCurrentPage = Math.min(reportsTotalPages, reportsCurrentPage + 1)}
            disabled={reportsCurrentPage === reportsTotalPages}
            class="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      {/if}
    {/if}

    {:else if activeTab === 'users'}
    <!-- Users Section -->
    <!-- Users Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Users</div>
        <div class="text-3xl font-bold text-neutral-900 dark:text-white">{totalUsers}</div>
      </div>
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Online Now</div>
        <div class="text-3xl font-bold text-green-600 dark:text-green-400">
          {realOnlineCount}
        </div>
        <div class="text-xs text-neutral-500 dark:text-neutral-500 mt-1">Live count</div>
      </div>
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Banned</div>
        <div class="text-3xl font-bold text-danger-600 dark:text-danger-400">
          {users.filter(u => u.status === 'banned').length}
        </div>
      </div>
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Active</div>
        <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {users.filter(u => u.status === 'active').length}
        </div>
      </div>
    </div>

    <!-- Users Filters -->
    <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            type="text"
            bind:value={usersSearchQuery}
            on:input={() => loadUsers()}
            placeholder="Search by nickname or country..."
            class="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary-500"
          />
        </div>
        <select
          bind:value={usersStatusFilter}
          on:change={() => loadUsers()}
          class="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
        <select
          bind:value={usersSortBy}
          on:change={() => loadUsers()}
          class="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
        >
          <option value="created_at">Join Date</option>
          <option value="last_seen">Last Seen</option>
          <option value="nickname">Nickname</option>
          <option value="message_count">Messages</option>
        </select>
        <select
          bind:value={usersSortOrder}
          on:change={() => loadUsers()}
          class="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
    </div>

    <!-- Users List -->
    {#if isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    {:else if error}
      <div class="bg-danger-100 dark:bg-danger-500/20 border border-danger-500 rounded-lg p-6 text-center">
        <p class="text-danger-700 dark:text-danger-400">{error}</p>
      </div>
    {:else if filteredUsers.length === 0}
      <div class="bg-neutral-200 dark:bg-neutral-800 rounded-xl p-12 text-center border border-neutral-300 dark:border-neutral-700">
        <p class="text-neutral-600 dark:text-neutral-400 text-lg">No users found</p>
      </div>
    {:else}
      <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <table class="w-full">
          <thead class="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
            <tr>
              <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">User</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Details</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Activity</th>
              <th class="text-right px-6 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-700">
            {#each paginatedUsers as user (user.id)}
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                <!-- User Info -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div>
                      <div class="font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                        {user.nickname}
                        {#if user.role === 'admin'}
                          <span class="px-2 py-0.5 text-xs bg-purple-500 text-white rounded">ADMIN</span>
                        {/if}
                      </div>
                      <div class="text-sm text-neutral-500 dark:text-neutral-400">{user.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>

                <!-- Details -->
                <td class="px-6 py-4">
                  <div class="text-sm text-neutral-900 dark:text-white">
                    {user.gender}, {user.age}, {user.country}
                  </div>
                  <div class="text-xs text-neutral-500 dark:text-neutral-400">
                    Joined {formatDate(user.created_at)}
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  {#if user.status === 'banned'}
                    <div class="inline-flex items-center gap-2">
                      <span class="px-2 py-1 text-xs font-medium bg-danger-100 text-danger-800 dark:bg-danger-500/20 dark:text-danger-400 rounded">
                        BANNED
                      </span>
                    </div>
                    {#if user.ban_reason}
                      <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        {user.ban_reason}
                      </div>
                    {/if}
                  {:else}
                    <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 rounded">
                      ACTIVE
                    </span>
                  {/if}
                </td>

                <!-- Activity -->
                <td class="px-6 py-4">
                  <div class="text-sm text-neutral-900 dark:text-white">
                    {user.message_count} messages
                  </div>
                  <div class="text-xs text-neutral-500 dark:text-neutral-400">
                    Last seen: {formatDate(user.last_seen)}
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    {#if user.status === 'banned'}
                      <button
                        on:click={() => unbanUser(user.id, 'users')}
                        class="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Unban
                      </button>
                    {:else if user.role !== 'admin'}
                      <button
                        on:click={() => openBanModal(user.id, user.nickname)}
                        class="px-3 py-1 text-xs bg-danger-500 text-white rounded hover:bg-danger-600 transition-colors"
                      >
                        Ban
                      </button>
                    {/if}
                    {#if user.role !== 'admin'}
                      <button
                        on:click={() => openDeleteUserModal(user.id, user.nickname)}
                        class="px-3 py-1 text-xs bg-neutral-500 text-white rounded hover:bg-neutral-600 transition-colors"
                      >
                        Delete
                      </button>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Users Pagination -->
      {#if usersTotalPages > 1}
        <div class="flex items-center justify-center gap-2 mt-8">
          <button
            on:click={() => usersCurrentPage = Math.max(1, usersCurrentPage - 1)}
            disabled={usersCurrentPage === 1}
            class="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span class="text-neutral-700 dark:text-neutral-300">
            Page {usersCurrentPage} of {usersTotalPages}
          </span>
          <button
            on:click={() => usersCurrentPage = Math.min(usersTotalPages, usersCurrentPage + 1)}
            disabled={usersCurrentPage === usersTotalPages}
            class="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      {/if}
    {/if}

    {:else if activeTab === 'settings'}
    <!-- Settings Section -->
    {#if isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    {:else if settings}
      <!-- Settings Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">Site Settings</h2>
          <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Configure ChatWii features, limits, and behavior
          </p>
        </div>
        <button
          on:click={resetAllSettings}
          class="px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors text-sm font-medium"
        >
          Reset All to Defaults
        </button>
      </div>

      {#if settingsChanged}
        <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p class="text-sm text-green-800 dark:text-green-200">
            Settings updated successfully! Changes will take effect immediately for new requests.
          </p>
        </div>
      {/if}

      <!-- Feature Toggles -->
      {#if settings.features}
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Feature Toggles</h3>
        <div class="space-y-4">
          {#each settings.features as setting}
            <div class="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700 last:border-0">
              <div class="flex-1">
                <div class="font-medium text-neutral-900 dark:text-white capitalize">
                  {setting.key.replace(/_/g, ' ')}
                </div>
                <div class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {setting.description}
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={setting.value}
                  on:change={(e) => updateSetting(setting.key, e.currentTarget.checked)}
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary-300 dark:peer-focus:ring-secondary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-secondary-500"></div>
              </label>
            </div>
          {/each}
        </div>
      </div>
      {/if}

      <!-- Rate Limits -->
      {#if settings.limits}
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Rate Limits & Restrictions</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {#each settings.limits as setting}
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 capitalize">
                {setting.key.replace(/_/g, ' ')}
              </label>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                {setting.description}
              </p>
              <input
                type="number"
                value={setting.value}
                on:change={(e) => updateSetting(setting.key, parseInt(e.currentTarget.value))}
                class="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
              />
            </div>
          {/each}
        </div>
      </div>
      {/if}

      <!-- Content Moderation -->
      {#if settings.moderation}
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Content Moderation</h3>
        <div class="space-y-6">
          {#each settings.moderation as setting}
            <div>
              {#if typeof setting.value === 'boolean'}
                <div class="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <div class="flex-1">
                    <div class="font-medium text-neutral-900 dark:text-white capitalize">
                      {setting.key.replace(/_/g, ' ')}
                    </div>
                    <div class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {setting.description}
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.value}
                      on:change={(e) => updateSetting(setting.key, e.currentTarget.checked)}
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary-300 dark:peer-focus:ring-secondary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-secondary-500"></div>
                  </label>
                </div>
              {:else}
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 capitalize">
                  {setting.key.replace(/_/g, ' ')}
                </label>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  {setting.description}
                </p>
                <textarea
                  value={JSON.stringify(setting.value)}
                  on:change={(e) => {
                    try {
                      const parsed = JSON.parse(e.currentTarget.value);
                      updateSetting(setting.key, parsed);
                    } catch (err) {
                      alert('Invalid JSON format');
                    }
                  }}
                  rows="3"
                  class="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  placeholder='["keyword1", "keyword2"]'
                ></textarea>
              {/if}
            </div>
          {/each}
        </div>
      </div>
      {/if}

      <!-- User Settings -->
      {#if settings.user_settings}
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">User Registration Settings</h3>
        <div class="space-y-6">
          {#each settings.user_settings as setting}
            <div>
              {#if typeof setting.value === 'boolean'}
                <div class="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <div class="flex-1">
                    <div class="font-medium text-neutral-900 dark:text-white capitalize">
                      {setting.key.replace(/_/g, ' ')}
                    </div>
                    <div class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {setting.description}
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.value}
                      on:change={(e) => updateSetting(setting.key, e.currentTarget.checked)}
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary-300 dark:peer-focus:ring-secondary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-secondary-500"></div>
                  </label>
                </div>
              {:else if Array.isArray(setting.value)}
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 capitalize">
                  {setting.key.replace(/_/g, ' ')}
                </label>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  {setting.description}
                </p>
                <textarea
                  value={JSON.stringify(setting.value)}
                  on:change={(e) => {
                    try {
                      const parsed = JSON.parse(e.currentTarget.value);
                      updateSetting(setting.key, parsed);
                    } catch (err) {
                      alert('Invalid JSON format');
                    }
                  }}
                  rows="2"
                  class="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  placeholder='["US", "UK", "CA"]'
                ></textarea>
              {:else}
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 capitalize">
                  {setting.key.replace(/_/g, ' ')}
                </label>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  {setting.description}
                </p>
                <input
                  type="number"
                  value={setting.value}
                  on:change={(e) => updateSetting(setting.key, parseInt(e.currentTarget.value))}
                  class="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              {/if}
            </div>
          {/each}
        </div>
      </div>
      {/if}

      <!-- Chat Settings -->
      {#if settings.chat_settings}
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Chat Settings</h3>
        <div class="space-y-4">
          {#each settings.chat_settings as setting}
            <div>
              {#if typeof setting.value === 'boolean'}
                <div class="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700 last:border-0">
                  <div class="flex-1">
                    <div class="font-medium text-neutral-900 dark:text-white capitalize">
                      {setting.key.replace(/_/g, ' ')}
                    </div>
                    <div class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {setting.description}
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.value}
                      on:change={(e) => updateSetting(setting.key, e.currentTarget.checked)}
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary-300 dark:peer-focus:ring-secondary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-secondary-500"></div>
                  </label>
                </div>
              {:else}
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 capitalize">
                  {setting.key.replace(/_/g, ' ')}
                </label>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  {setting.description}
                </p>
                <input
                  type="number"
                  value={setting.value}
                  on:change={(e) => updateSetting(setting.key, parseInt(e.currentTarget.value))}
                  class="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              {/if}
            </div>
          {/each}
        </div>
      </div>
      {/if}

      <!-- System Configuration -->
      {#if settings.system}
      <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">System Configuration</h3>
        <div class="space-y-6">
          {#each settings.system as setting}
            <div>
              {#if typeof setting.value === 'boolean'}
                <div class="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <div class="flex-1">
                    <div class="font-medium text-neutral-900 dark:text-white capitalize">
                      {setting.key.replace(/_/g, ' ')}
                    </div>
                    <div class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {setting.description}
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.value}
                      on:change={(e) => updateSetting(setting.key, e.currentTarget.checked)}
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary-300 dark:peer-focus:ring-secondary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-secondary-500"></div>
                  </label>
                </div>
              {:else if typeof setting.value === 'number'}
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 capitalize">
                  {setting.key.replace(/_/g, ' ')}
                </label>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  {setting.description}
                </p>
                <input
                  type="number"
                  value={setting.value}
                  on:change={(e) => updateSetting(setting.key, parseInt(e.currentTarget.value))}
                  class="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              {:else}
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 capitalize">
                  {setting.key.replace(/_/g, ' ')}
                </label>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  {setting.description}
                </p>
                <input
                  type="text"
                  value={setting.value}
                  on:change={(e) => updateSetting(setting.key, e.currentTarget.value)}
                  class="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              {/if}
            </div>
          {/each}
        </div>
      </div>
      {/if}
    {/if}
    {/if}
  </main>
</div>

<!-- Delete User Modal -->
{#if showDeleteUserModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-4">Delete User</h3>
      <p class="text-neutral-600 dark:text-neutral-400 mb-4">
        Are you sure you want to delete <span class="font-semibold">{deleteUserNickname}</span>? This action cannot be undone and will permanently delete all user data, messages, and associated records.
      </p>

      <div class="flex gap-3">
        <button
          on:click={() => showDeleteUserModal = false}
          disabled={deleteUserLoading}
          class="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          on:click={handleDeleteUser}
          disabled={deleteUserLoading}
          class="flex-1 px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {#if deleteUserLoading}
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deleting...
          {:else}
            Delete User
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Ban User Modal -->
{#if showBanModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-4">Ban User</h3>
      <p class="text-neutral-600 dark:text-neutral-400 mb-4">
        You are about to ban <span class="font-semibold">{banUserNickname}</span>
      </p>

      <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
        Ban Reason <span class="text-danger-500">*</span>
      </label>
      <textarea
        bind:value={banReason}
        placeholder="Enter the reason for banning this user..."
        rows="4"
        class="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 mb-4"
      ></textarea>

      <div class="flex gap-3">
        <button
          on:click={() => showBanModal = false}
          disabled={banLoading}
          class="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          on:click={handleBan}
          disabled={banLoading || !banReason.trim()}
          class="flex-1 px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {#if banLoading}
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Banning...
          {:else}
            Ban User
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
