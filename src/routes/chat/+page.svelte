<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/authStore';
  import { AuthService } from '$lib/services/authService';
  import { presenceStore, sortedOnlineUsers, onlineUserCount } from '$lib/stores/presenceStore';
  import { blockStore, blockedUserIds } from '$lib/stores/blockStore';
  import { blockingService } from '$lib/services/blockingService';
  import { messageService } from '$lib/services/messageService';
  import { reportService } from '$lib/services/reportService';
  import type { Message } from '$lib/services/messageService';
  import { supabase } from '$lib/supabase';
  import ThemeToggle from '$lib/components/shared/ThemeToggle.svelte';
  import UserListItem from '$lib/components/chat/UserListItem.svelte';
  import MessageList from '$lib/components/chat/MessageList.svelte';
  import MessageInput from '$lib/components/chat/MessageInput.svelte';
  import ChatHeaderMenu from '$lib/components/chat/ChatHeaderMenu.svelte';
  import ReportModal from '$lib/components/chat/ReportModal.svelte';
  import RulesModal from '$lib/components/chat/RulesModal.svelte';
  import CountryFlag from '$lib/components/shared/CountryFlag.svelte';
  import Avatar from '$lib/components/shared/Avatar.svelte';
  import type { PresenceUser } from '$lib/services/presenceService';
  import { countryCodeToName } from '$lib/utils/countries';
  import { isMobile } from '$lib/utils/deviceDetection';

  let loading = true;
  let userProfile: any = null;
  let selectedUser: PresenceUser | null = null;
  let messages: Message[] = [];
  let loadingMessages = false;
  let loadingMoreMessages = false;
  let hasMoreMessages = false;
  let totalMessageCount = 0;
  let messageCount = 0;
  let rateLimit = 25;
  let showHeaderMenu = false;
  let blockError = '';
  let blockSuccess = '';
  let showBlockedNotification = false;
  let showReportModal = false;
  let reportError = '';
  let reportSuccess = '';
  let showRulesModal = false;
  let showHistorySidebar = false;
  let showLogoutConfirm = false;
  let showInboxModal = false;
  let unreadCount = 0;
  let inboxConversations: any[] = []; // Incoming messages only
  let historyConversations: any[] = []; // Sent messages only
  let searchQuery = '';
  let showFilterModal = false;
  let showMobileUserList = false; // Mobile user list overlay

  // Kick notification state
  let showKickNotification = false;
  let kickReason = '';
  let kickCountdown = 5;
  let kickChannel: any = null;

  // Filter state
  let filterGender: string[] = []; // ['male', 'female']
  let filterAgeMin = 18;
  let filterAgeMax = 90;
  let filterCountries: string[] = []; // Country codes

  // Load inbox and history from localStorage on mount
  if (typeof window !== 'undefined') {
    const savedInbox = localStorage.getItem('chatwii_inbox');
    const savedHistory = localStorage.getItem('chatwii_history');

    if (savedInbox) {
      try {
        const parsedInbox = JSON.parse(savedInbox);
        // Filter out messages older than 8 hours on load
        const eightHoursInMs = 8 * 60 * 60 * 1000;
        const now = Date.now();
        inboxConversations = parsedInbox.filter((conv: any) => {
          const messageAge = now - new Date(conv.last_message_time).getTime();
          return messageAge < eightHoursInMs;
        });
      } catch (e) {
        console.error('Failed to load inbox:', e);
      }
    }

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Filter out messages older than 8 hours on load
        const eightHoursInMs = 8 * 60 * 60 * 1000;
        const now = Date.now();
        historyConversations = parsedHistory.filter((conv: any) => {
          const messageAge = now - new Date(conv.last_message_time).getTime();
          return messageAge < eightHoursInMs;
        });
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }

  // Save inbox to localStorage whenever it changes
  $: if (typeof window !== 'undefined' && inboxConversations) {
    localStorage.setItem('chatwii_inbox', JSON.stringify(inboxConversations));
  }

  // Save history to localStorage whenever it changes
  $: if (typeof window !== 'undefined' && historyConversations) {
    localStorage.setItem('chatwii_history', JSON.stringify(historyConversations));
  }

  // Filter and sort inbox by most recent message time (exclude messages older than 8 hours)
  $: sortedInbox = [...inboxConversations]
    .filter(conv => {
      const messageAge = Date.now() - new Date(conv.last_message_time).getTime();
      const eightHoursInMs = 8 * 60 * 60 * 1000;
      return messageAge < eightHoursInMs;
    })
    .sort((a, b) => {
      return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
    });

  // Filter and sort history by most recent message time (exclude messages older than 8 hours)
  $: sortedHistory = [...historyConversations]
    .filter(conv => {
      const messageAge = Date.now() - new Date(conv.last_message_time).getTime();
      const eightHoursInMs = 8 * 60 * 60 * 1000;
      return messageAge < eightHoursInMs;
    })
    .sort((a, b) => {
      return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
    });

  $: isSelectedUserBlocked = selectedUser ? $blockedUserIds.includes(selectedUser.user_id) : false;

  // Check if any filters are active
  $: hasActiveFilters = filterGender.length > 0 || filterCountries.length > 0 || filterAgeMin > 18 || filterAgeMax < 90;

  // Filter users based on search query and filters
  $: filteredUsers = $sortedOnlineUsers.filter(user => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (!user.nickname.toLowerCase().includes(query)) return false;
    }

    // Gender filter
    if (filterGender.length > 0) {
      if (!filterGender.includes(user.gender)) return false;
    }

    // Country filter
    if (filterCountries.length > 0) {
      if (!filterCountries.includes(user.country)) return false;
    }

    // Age filter
    if (user.age < filterAgeMin || user.age > filterAgeMax) {
      return false;
    }

    return true;
  });

  // Cleanup old conversations from localStorage (older than 8 hours)
  function cleanupOldConversations() {
    const eightHoursInMs = 8 * 60 * 60 * 1000;
    const now = Date.now();

    // Clean inbox
    inboxConversations = inboxConversations.filter(conv => {
      const messageAge = now - new Date(conv.last_message_time).getTime();
      return messageAge < eightHoursInMs;
    });

    // Clean history
    historyConversations = historyConversations.filter(conv => {
      const messageAge = now - new Date(conv.last_message_time).getTime();
      return messageAge < eightHoursInMs;
    });
  }

  onMount(async () => {
    // Check if user is authenticated
    const isAuth = await AuthService.isAuthenticated();

    if (!isAuth) {
      // Redirect to landing page if not authenticated
      goto('/');
      return;
    }

    // Get user profile
    const user = await AuthService.getCurrentUser();
    if (user) {
      userProfile = await AuthService.getUserProfile(user.id);

      // Initialize presence tracking
      if (userProfile) {
        await presenceStore.init(
          user.id,
          userProfile.nickname,
          userProfile.gender,
          userProfile.age,
          userProfile.country
        );

        // Initialize blocking
        await blockStore.init(user.id);

        // Initialize messaging
        await messageService.init(user.id);

        // Subscribe to new messages
        messageService.onNewMessage((message) => {
          // Note: Blocking is enforced server-side in messageService.sendMessage()
          // So we don't need to filter here - blocked messages never reach the database

          // Add to messages if it's from or to the selected user
          if (selectedUser &&
              (message.sender_id === selectedUser.user_id || message.receiver_id === selectedUser.user_id)) {
            messages = [...messages, message];

            // If message is from someone else and not currently viewing them, increment unread
            if (message.sender_id !== user.id && message.sender_id !== selectedUser?.user_id) {
              unreadCount++;
            }
          } else if (message.sender_id !== user.id) {
            // Message from someone not currently selected - increment unread
            unreadCount++;
          }

          // Update inbox and history separately
          const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
          const otherUser = $sortedOnlineUsers.find(u => u.user_id === otherUserId);

          const messagePreview = message.message_type === 'image' ? '📷 Image' : message.content;

          // If this is an INCOMING message, update inbox
          if (message.sender_id !== user.id) {
            const existingInboxIndex = inboxConversations.findIndex(c => c.user_id === otherUserId);
            if (existingInboxIndex >= 0) {
              inboxConversations[existingInboxIndex] = {
                ...inboxConversations[existingInboxIndex],
                last_message: messagePreview,
                last_message_time: message.created_at,
                unread: (inboxConversations[existingInboxIndex].unread || 0) + 1
              };
              inboxConversations = [...inboxConversations];
            } else if (otherUser) {
              inboxConversations = [...inboxConversations, {
                user_id: otherUserId,
                nickname: otherUser.nickname,
                gender: otherUser.gender,
                age: otherUser.age,
                country: otherUser.country,
                last_message: messagePreview,
                last_message_time: message.created_at,
                unread: 1
              }];
            }
          }

          // If this is an OUTGOING message (sent by me), update history
          if (message.sender_id === user.id) {
            const existingHistoryIndex = historyConversations.findIndex(c => c.user_id === otherUserId);
            if (existingHistoryIndex >= 0) {
              historyConversations[existingHistoryIndex] = {
                ...historyConversations[existingHistoryIndex],
                last_message: messagePreview,
                last_message_time: message.created_at
              };
              historyConversations = [...historyConversations];
            } else if (otherUser) {
              historyConversations = [...historyConversations, {
                user_id: otherUserId,
                nickname: otherUser.nickname,
                gender: otherUser.gender,
                age: otherUser.age,
                country: otherUser.country,
                last_message: messagePreview,
                last_message_time: message.created_at
              }];
            }
          }
        });

        // Update message count every 5 seconds
        updateMessageCount();
        setInterval(updateMessageCount, 5000);

        // Cleanup old conversations every minute
        cleanupOldConversations();
        setInterval(cleanupOldConversations, 60000);

        // Subscribe to personal kick channel for admin actions
        kickChannel = supabase.channel(`user:${user.id}`);
        kickChannel
          .on('broadcast', { event: 'kick' }, (payload: any) => {
            kickReason = payload.payload.reason || 'No reason provided';
            showKickNotification = true;

            // Start countdown
            let countdown = 5;
            kickCountdown = countdown;
            const timer = setInterval(() => {
              countdown--;
              kickCountdown = countdown;
              if (countdown <= 0) {
                clearInterval(timer);
                // Logout and redirect
                AuthService.signOut();
                goto('/');
              }
            }, 1000);
          })
          .subscribe();
      }
    }

    loading = false;

    // Check if user has accepted rules (localStorage)
    const hasAcceptedRules = localStorage.getItem('chatwii_rules_accepted');
    if (!hasAcceptedRules) {
      // Show rules modal after 5 seconds
      setTimeout(() => {
        showRulesModal = true;
      }, 5000);
    }
  });

  onDestroy(async () => {
    // Disconnect messaging
    await messageService.disconnect();
    // Leave presence on component destroy
    await presenceStore.leave();
    // Clear block store
    blockStore.clear();
    // Unsubscribe from kick channel
    if (kickChannel) {
      await kickChannel.unsubscribe();
    }
  });

  async function updateMessageCount() {
    if (userProfile) {
      const result = await messageService.checkRateLimit(userProfile.id);
      messageCount = result.count;
      rateLimit = result.limit;
    }
  }

  async function handleSignOut() {
    await messageService.disconnect();
    await presenceStore.leave();
    blockStore.clear();

    // Clear conversation data from localStorage (anti-stalking)
    localStorage.removeItem('chatwii_inbox');
    localStorage.removeItem('chatwii_history');
    inboxConversations = [];
    historyConversations = [];

    await AuthService.signOut();
    authStore.clear();
    goto('/feedback');
  }

  async function selectUser(user: PresenceUser) {
    selectedUser = user;
    blockError = '';
    blockSuccess = '';

    // Close mobile user list when user is selected
    if ($isMobile) {
      showMobileUserList = false;
    }

    // Load conversation history
    if (userProfile) {
      loadingMessages = true;

      // Get total message count
      totalMessageCount = await messageService.getConversationCount(userProfile.id, user.user_id);

      // Load initial batch (100 messages)
      messages = await messageService.loadConversation(userProfile.id, user.user_id, 100, 0);

      // Check if there are more messages
      hasMoreMessages = totalMessageCount > messages.length;

      loadingMessages = false;
    }
  }

  async function handleLoadMoreMessages() {
    if (!userProfile || !selectedUser || loadingMoreMessages) return;

    loadingMoreMessages = true;

    // Load next batch
    const currentOffset = messages.length;
    const olderMessages = await messageService.loadConversation(
      userProfile.id,
      selectedUser.user_id,
      100,
      currentOffset
    );

    // Prepend older messages to the beginning
    messages = [...olderMessages, ...messages];

    // Update total count in case new messages were added
    totalMessageCount = await messageService.getConversationCount(userProfile.id, selectedUser.user_id);

    // Check if there are still more messages
    hasMoreMessages = totalMessageCount > messages.length;

    loadingMoreMessages = false;
  }

  async function handleSendMessage(event: CustomEvent<string>) {
    const content = event.detail;

    if (!userProfile || !selectedUser) return;

    // Optimistically add message to UI
    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      sender_id: userProfile.id,
      receiver_id: selectedUser.user_id,
      content,
      message_type: 'text',
      status: 'sending',
      created_at: new Date().toISOString(),
    };

    messages = [...messages, tempMessage];

    // Send message (blocking check happens server-side)
    const result = await messageService.sendMessage({
      senderId: userProfile.id,
      receiverId: selectedUser.user_id,
      content,
    });

    if (result.success && result.message) {
      // Replace temp message with real message
      messages = messages.map(m => m.id === tempMessage.id ? result.message! : m);

      // Manually update history (don't rely on real-time callback)
      const messagePreview = content.length > 50 ? content.substring(0, 50) + '...' : content;
      const existingHistoryIndex = historyConversations.findIndex(c => c.user_id === selectedUser.user_id);
      if (existingHistoryIndex >= 0) {
        historyConversations[existingHistoryIndex] = {
          ...historyConversations[existingHistoryIndex],
          last_message: messagePreview,
          last_message_time: result.message.created_at
        };
        historyConversations = [...historyConversations];
      } else {
        historyConversations = [...historyConversations, {
          user_id: selectedUser.user_id,
          nickname: selectedUser.nickname,
          gender: selectedUser.gender,
          age: selectedUser.age,
          country: selectedUser.country,
          last_message: messagePreview,
          last_message_time: result.message.created_at
        }];
      }

      // Update message count
      await updateMessageCount();
    } else {
      // Remove temp message from UI
      messages = messages.filter(m => m.id !== tempMessage.id);

      // Show error message
      if (result.isBlocked) {
        // Show visual notification in chat area
        showBlockedNotification = true;
        setTimeout(() => { showBlockedNotification = false; }, 4000);
      } else {
        blockError = result.error || 'Failed to send message';
        setTimeout(() => { blockError = ''; }, 3000);
      }
    }
  }

  async function handleImageUpload(event: CustomEvent<string>) {
    if (!userProfile || !selectedUser) return;

    console.log('handleImageUpload received event:', event);
    console.log('handleImageUpload event.detail:', event.detail);
    console.log('handleImageUpload event.detail type:', typeof event.detail);

    const imageUrl = event.detail;

    console.log('Image URL to save:', imageUrl);

    // Optimistically add message to UI
    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      sender_id: userProfile.id,
      receiver_id: selectedUser.user_id,
      content: imageUrl,
      message_type: 'image',
      status: 'sending',
      created_at: new Date().toISOString(),
    };

    messages = [...messages, tempMessage];

    console.log('Sending message with content:', imageUrl);

    // Send message (blocking check happens server-side)
    const result = await messageService.sendMessage({
      senderId: userProfile.id,
      receiverId: selectedUser.user_id,
      content: imageUrl,
      messageType: 'image',
    });

    console.log('Message send result:', result);

    if (result.success && result.message) {
      // Replace temp message with real message
      messages = messages.map(m => m.id === tempMessage.id ? result.message! : m);

      // Manually update history (don't rely on real-time callback)
      const messagePreview = '📷 Image';
      const existingHistoryIndex = historyConversations.findIndex(c => c.user_id === selectedUser.user_id);
      if (existingHistoryIndex >= 0) {
        historyConversations[existingHistoryIndex] = {
          ...historyConversations[existingHistoryIndex],
          last_message: messagePreview,
          last_message_time: result.message.created_at
        };
        historyConversations = [...historyConversations];
      } else {
        historyConversations = [...historyConversations, {
          user_id: selectedUser.user_id,
          nickname: selectedUser.nickname,
          gender: selectedUser.gender,
          age: selectedUser.age,
          country: selectedUser.country,
          last_message: messagePreview,
          last_message_time: result.message.created_at
        }];
      }

      // Update message count
      await updateMessageCount();
    } else {
      // Remove temp message from UI
      messages = messages.filter(m => m.id !== tempMessage.id);

      // Show error message
      if (result.isBlocked) {
        // Show visual notification in chat area
        showBlockedNotification = true;
        setTimeout(() => { showBlockedNotification = false; }, 4000);
      } else {
        blockError = result.error || 'Failed to send image';
        setTimeout(() => { blockError = ''; }, 3000);
      }
    }
  }

  async function handleBlockUser() {
    if (!userProfile || !selectedUser) return;

    const result = await blockStore.blockUser(userProfile.id, selectedUser.user_id);

    if (result.success) {
      blockSuccess = 'User blocked successfully';
      blockError = '';
      setTimeout(() => {
        blockSuccess = '';
      }, 2000);
    } else {
      blockError = result.error || 'Failed to block user';
      blockSuccess = '';
    }
  }

  async function handleUnblockUser() {
    if (!userProfile || !selectedUser) return;

    const result = await blockStore.unblockUser(userProfile.id, selectedUser.user_id);

    if (result.success) {
      blockSuccess = 'User unblocked successfully';
      blockError = '';
      setTimeout(() => {
        blockSuccess = '';
      }, 2000);
    } else {
      blockError = result.error || 'Failed to unblock user';
      blockSuccess = '';
    }
  }

  function handleReportUser() {
    showReportModal = true;
  }

  async function handleReportSubmit(event: CustomEvent<{ reason: string; details: string | null }>) {
    if (!userProfile || !selectedUser) return;

    const { reason, details } = event.detail;

    const result = await reportService.submitReport({
      reporterId: userProfile.id,
      reportedId: selectedUser.user_id,
      reason: reason as any,
      details,
    });

    if (result.success) {
      reportSuccess = 'Report submitted successfully. Thank you for helping keep our community safe.';
      reportError = '';
      showReportModal = false;
      setTimeout(() => {
        reportSuccess = '';
      }, 4000);
    } else {
      reportError = result.error || 'Failed to submit report';
      reportSuccess = '';
    }
  }

  function handleRulesAccept() {
    // Save acceptance to localStorage
    localStorage.setItem('chatwii_rules_accepted', 'true');
    showRulesModal = false;
  }

  async function handleRulesDecline() {
    // User declined rules, sign them out and redirect
    await messageService.disconnect();
    await presenceStore.leave();
    blockStore.clear();
    await AuthService.signOut();
    authStore.clear();
    goto('/');
  }
</script>

{#if loading}
  <div class="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
    <div class="text-center">
      <svg class="w-12 h-12 animate-spin mx-auto mb-4 text-secondary-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-neutral-600 dark:text-neutral-400">Loading chat...</p>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-neutral-100 dark:bg-neutral-900 overflow-x-hidden">
    <!-- Header -->
    <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between">
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <img src="/logo/logo.png" alt="ChatWii" class="h-8 sm:h-10 w-auto flex-shrink-0" />
        {#if userProfile}
          <!-- Hide welcome text on mobile -->
          <div class="hidden md:flex items-center gap-2">
            <span class="text-sm text-neutral-600 dark:text-neutral-400">Welcome,</span>
            <span class="text-sm font-medium text-neutral-900 dark:text-white">{userProfile.nickname}</span>
          </div>
        {/if}
      </div>
      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <!-- Mobile: User List Toggle Button -->
        <button
          on:click={() => showMobileUserList = !showMobileUserList}
          class="md:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          class:bg-neutral-100={showMobileUserList}
          class:dark:bg-neutral-700={showMobileUserList}
          title="User List"
        >
          <svg class="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>

        <!-- Inbox Icon with Badge -->
        <button
          on:click={() => { showInboxModal = true; unreadCount = 0; }}
          class="relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          title="Messages"
        >
          <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {#if unreadCount > 0}
            <span class="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          {/if}
        </button>

        <!-- History Icon -->
        <button
          on:click={() => showHistorySidebar = !showHistorySidebar}
          class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          class:bg-neutral-100={showHistorySidebar}
          class:dark:bg-neutral-700={showHistorySidebar}
          title="Conversation History"
        >
          <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- Theme Toggle -->
        <ThemeToggle />

        <!-- Logout Icon (Red) -->
        <button
          on:click={() => showLogoutConfirm = true}
          class="p-2 text-danger-500 hover:bg-danger-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          title="Logout"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-full overflow-hidden">
      <!-- User List Sidebar - Hidden on mobile, visible on desktop -->
      <aside class="hidden md:block md:w-80 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex-shrink-0">
        <!-- Header with count -->
        <div class="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-semibold text-success-500">Online Users:</h2>
            <span class="text-base font-bold text-success-500">
              {$onlineUserCount}
            </span>
          </div>

          <!-- Search and Filter -->
          <div class="mt-3 flex items-center gap-2">
            <div class="flex-1 relative">
              <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search users..."
                class="w-full pl-9 pr-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary-500"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              on:click={() => showFilterModal = true}
              class="relative p-2 rounded-lg transition-colors"
              class:bg-neutral-100={!hasActiveFilters}
              class:dark:bg-neutral-700={!hasActiveFilters}
              class:hover:bg-neutral-200={!hasActiveFilters}
              class:dark:hover:bg-neutral-600={!hasActiveFilters}
              class:bg-secondary-100={hasActiveFilters}
              class:dark:bg-secondary-900={hasActiveFilters}
              title="Filter users"
            >
              <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" class:text-secondary-500={hasActiveFilters} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {#if hasActiveFilters}
                <span class="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full"></span>
              {/if}
            </button>
          </div>
        </div>

        <!-- User List -->
        <div class="overflow-y-auto h-[calc(100vh-11rem)]">
          {#if filteredUsers.length === 0 && searchQuery}
            <div class="p-8 text-center">
              <svg class="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p class="text-neutral-500 dark:text-neutral-400">No users found</p>
              <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-2">Try a different search term</p>
            </div>
          {:else if $sortedOnlineUsers.length === 0}
            <div class="p-8 text-center">
              <svg class="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-neutral-500 dark:text-neutral-400">No users online</p>
              <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-2">Waiting for others to join...</p>
            </div>
          {:else}
            <div class="p-2 space-y-1">
              {#each filteredUsers as user (user.user_id)}
                {#if user.user_id !== userProfile?.id}
                  <UserListItem
                    {user}
                    isSelected={selectedUser?.user_id === user.user_id}
                    isBlocked={$blockedUserIds.includes(user.user_id)}
                    onClick={() => selectUser(user)}
                  />
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      </aside>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col bg-neutral-100 dark:bg-neutral-900 min-w-0 w-full md:w-auto">
        {#if selectedUser}
          <!-- Chat Header -->
          <div class="h-14 sm:h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-3 sm:px-6 flex items-center justify-between">
            <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <!-- Mobile: Back button (shows user list) -->
              <button
                on:click={() => selectedUser = null}
                class="md:hidden p-2 -ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                title="Back to user list"
              >
                <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <!-- Avatar with gender ring -->
              <div class="rounded-full p-0.5 flex-shrink-0" class:bg-pink-300={selectedUser.gender === 'female'} class:bg-blue-500={selectedUser.gender === 'male'}>
                <Avatar gender={selectedUser.gender} size="sm" />
              </div>

              <!-- User info -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-neutral-900 dark:text-white truncate text-sm sm:text-base">{selectedUser.nickname}</span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2 text-xs">
                  <span class:text-pink-400={selectedUser.gender === 'female'} class:text-blue-500={selectedUser.gender === 'male'}>
                    {selectedUser.gender === 'female' ? 'Female' : 'Male'}
                  </span>
                  <span class="text-neutral-500 dark:text-neutral-400 hidden sm:inline">•</span>
                  <span class="text-neutral-500 dark:text-neutral-400 hidden sm:inline">{selectedUser.age}</span>
                  <span class="text-neutral-500 dark:text-neutral-400 hidden sm:inline">•</span>
                  <CountryFlag countryCode={selectedUser.country} size="sm" />
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <!-- Block/Unblock/Report status messages - Hidden on mobile -->
              {#if reportSuccess}
                <div class="hidden sm:block px-3 py-1 bg-success-100 dark:bg-success-500/20 text-success-500 text-sm rounded-lg">
                  {reportSuccess}
                </div>
              {/if}
              {#if blockSuccess}
                <div class="hidden sm:block px-3 py-1 bg-success-100 dark:bg-success-500/20 text-success-500 text-sm rounded-lg">
                  {blockSuccess}
                </div>
              {/if}
              {#if blockError}
                <div class="hidden sm:block px-3 py-1 bg-danger-100 dark:bg-danger-500/20 text-danger-500 text-sm rounded-lg">
                  {blockError}
                </div>
              {/if}
              {#if reportError}
                <div class="hidden sm:block px-3 py-1 bg-danger-100 dark:bg-danger-500/20 text-danger-500 text-sm rounded-lg">
                  {reportError}
                </div>
              {/if}
              <ChatHeaderMenu
                isBlocked={isSelectedUserBlocked}
                bind:showMenu={showHeaderMenu}
                on:block={handleBlockUser}
                on:unblock={handleUnblockUser}
                on:report={handleReportUser}
              />
              <!-- Close conversation button - Desktop only -->
              <button
                on:click={() => selectedUser = null}
                class="hidden md:block p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                title="Close conversation"
              >
                <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Messages Area -->
          <MessageList
            {messages}
            currentUserId={userProfile?.id}
            loading={loadingMessages}
            {hasMoreMessages}
            loadingMore={loadingMoreMessages}
            on:loadmore={handleLoadMoreMessages}
          />

          <!-- Blocked notification (positioned above message input) -->
          {#if showBlockedNotification}
            <div class="px-6 py-3 bg-danger-100 dark:bg-danger-500/20 border-t border-danger-500">
              <div class="flex items-center gap-3">
                <svg class="w-6 h-6 text-danger-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-medium text-danger-500">You have been blocked by this user. Your message was not delivered.</p>
                </div>
              </div>
            </div>
          {/if}

          <!-- Message Input -->
          <MessageInput
            on:send={handleSendMessage}
            on:image={handleImageUpload}
            userId={userProfile?.id || ''}
            disabled={false}
            {messageCount}
            {rateLimit}
          />
        {:else}
          <!-- Empty State - Desktop shows placeholder -->
          <div class="flex-1 flex flex-col">
            <!-- Desktop: Placeholder -->
            <div class="hidden md:flex flex-1 items-center justify-center">
              <div class="text-center">
                <svg class="w-24 h-24 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 class="text-xl font-medium text-neutral-900 dark:text-white mb-2">
                  Select a user to start chatting
                </h3>
                <p class="text-neutral-500 dark:text-neutral-400">
                  Choose someone from the online users list
                </p>
              </div>
            </div>

            <!-- Mobile: Empty state with prompt -->
            <div class="md:hidden flex-1 flex items-center justify-center p-8">
              <div class="text-center">
                <svg class="w-20 h-20 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 class="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                  Tap the user list icon above (next to inbox)
                </h3>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">
                  Select a user to start chatting
                </p>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </main>

    <!-- Mobile User List Overlay -->
    {#if showMobileUserList}
      <div
        class="md:hidden fixed inset-0 bg-black/30 z-40"
        on:click={() => showMobileUserList = false}
      ></div>
      <div class="md:hidden fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white dark:bg-neutral-800 z-50 flex flex-col shadow-xl">
        <!-- Header -->
        <div class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold text-success-500">Online Users:</h2>
              <span class="text-base font-bold text-success-500">{$onlineUserCount}</span>
            </div>
            <!-- Close Button -->
            <button
              on:click={() => showMobileUserList = false}
              class="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title="Close"
            >
              <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Search and Filter -->
          <div class="flex items-center gap-2">
            <div class="flex-1 relative">
              <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search users..."
                class="w-full pl-9 pr-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary-500"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              on:click={() => showFilterModal = true}
              class="relative p-2 rounded-lg transition-colors"
              class:bg-neutral-100={!hasActiveFilters}
              class:dark:bg-neutral-700={!hasActiveFilters}
              class:bg-secondary-100={hasActiveFilters}
              class:dark:bg-secondary-900={hasActiveFilters}
              title="Filter users"
            >
              <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" class:text-secondary-500={hasActiveFilters} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {#if hasActiveFilters}
                <span class="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full"></span>
              {/if}
            </button>
          </div>
        </div>

        <!-- User List -->
        <div class="flex-1 overflow-y-auto">
          {#if filteredUsers.length === 0 && searchQuery}
            <div class="p-8 text-center">
              <svg class="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p class="text-neutral-500 dark:text-neutral-400">No users found</p>
            </div>
          {:else if $sortedOnlineUsers.length === 0}
            <div class="p-8 text-center">
              <svg class="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-neutral-500 dark:text-neutral-400">No users online</p>
            </div>
          {:else}
            <div class="p-2 space-y-1">
              {#each filteredUsers as user (user.user_id)}
                {#if user.user_id !== userProfile?.id}
                  <UserListItem
                    {user}
                    isSelected={false}
                    isBlocked={$blockedUserIds.includes(user.user_id)}
                    onClick={() => { selectUser(user); showMobileUserList = false; }}
                  />
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Report Modal -->
    <ReportModal
      bind:show={showReportModal}
      reportedUserNickname={selectedUser?.nickname || ''}
      on:submit={handleReportSubmit}
      on:close={() => {
        showReportModal = false;
        reportError = '';
      }}
    />

    <!-- Rules Modal -->
    <RulesModal
      bind:show={showRulesModal}
      on:accept={handleRulesAccept}
      on:decline={handleRulesDecline}
    />

    <!-- Kick Notification Banner -->
    {#if showKickNotification}
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl p-6 max-w-md w-full border-4 border-red-500">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <svg class="h-10 w-10 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-red-600 dark:text-red-500 mb-3">
              You've Been Kicked!
            </h3>
            <p class="text-neutral-700 dark:text-neutral-300 mb-4">
              <strong>Reason:</strong> {kickReason}
            </p>
            <div class="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-4 mb-4">
              <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                You will be disconnected in:
              </p>
              <p class="text-5xl font-bold text-red-600 dark:text-red-500">
                {kickCountdown}
              </p>
            </div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              You can rejoin immediately after being disconnected.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Logout Confirmation Dialog -->
    {#if showLogoutConfirm}
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showLogoutConfirm = false}>
        <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full p-6" on:click|stopPropagation>
          <div class="flex items-center gap-3 mb-4">
            <div class="p-3 bg-danger-100 dark:bg-danger-500/20 rounded-full">
              <svg class="w-6 h-6 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">Confirm Logout</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Are you sure you want to log out?</p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3">
            <button
              on:click={() => showLogoutConfirm = false}
              class="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              on:click={handleSignOut}
              class="px-4 py-2 text-sm font-medium text-white bg-danger-500 hover:bg-danger-600 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Inbox Sidebar -->
    {#if showInboxModal}
      <div
        class="fixed inset-0 bg-black/20 z-40"
        on:click={() => showInboxModal = false}
      ></div>
      <div class="fixed inset-y-0 right-0 w-80 bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 shadow-2xl z-50 transform transition-transform duration-300">
        <div class="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">Messages</h2>
          <button
            on:click={() => showInboxModal = false}
            class="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="overflow-y-auto h-[calc(100vh-5rem)] p-4">
          {#if sortedInbox.length === 0}
            <div class="text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">No messages yet</p>
              <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Waiting for incoming messages</p>
            </div>
          {:else}
            <div class="space-y-2">
              {#each sortedInbox as conv}
                <button
                  on:click={() => {
                    // Try to find in online users first, otherwise create a temporary user object
                    let user = $sortedOnlineUsers.find(u => u.user_id === conv.user_id);
                    if (!user) {
                      // User is offline, create a minimal user object from conversation data
                      user = {
                        user_id: conv.user_id,
                        nickname: conv.nickname,
                        gender: conv.gender || 'unknown',
                        age: conv.age || 0,
                        country: conv.country || 'Unknown',
                        online: false
                      };
                    }
                    selectUser(user);
                    showInboxModal = false;
                    // Clear unread count for this conversation
                    const convIndex = inboxConversations.findIndex(c => c.user_id === conv.user_id);
                    if (convIndex >= 0) {
                      inboxConversations[convIndex].unread = 0;
                      inboxConversations = [...inboxConversations];
                    }
                  }}
                  class="w-full text-left p-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg cursor-pointer transition-colors"
                >
                  <div class="flex items-center justify-between mb-1">
                    <p class="font-medium text-neutral-900 dark:text-white">{conv.nickname}</p>
                    <span class="text-xs text-neutral-500 dark:text-neutral-400">{new Date(conv.last_message_time).toLocaleTimeString()}</span>
                  </div>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400 truncate">{conv.last_message}</p>
                  {#if conv.unread > 0}
                    <span class="inline-block mt-1 px-2 py-0.5 text-xs bg-danger-500 text-white rounded-full">{conv.unread} new</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- History Sidebar -->
    {#if showHistorySidebar}
      <div
        class="fixed inset-0 bg-black/20 z-40"
        on:click={() => showHistorySidebar = false}
      ></div>
      <div class="fixed inset-y-0 right-0 w-80 bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 shadow-2xl z-50 transform transition-transform duration-300">
        <div class="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">Conversation History</h2>
          <button
            on:click={() => showHistorySidebar = false}
            class="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="overflow-y-auto h-[calc(100vh-5rem)] p-4">
          {#if sortedHistory.length === 0}
            <div class="text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">No conversation history yet</p>
              <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Your sent conversations will appear here</p>
            </div>
          {:else}
            <div class="space-y-2">
              {#each sortedHistory as conv}
                <button
                  on:click={() => {
                    // Try to find in online users first, otherwise create a temporary user object
                    let user = $sortedOnlineUsers.find(u => u.user_id === conv.user_id);
                    if (!user) {
                      // User is offline, create a minimal user object from conversation data
                      user = {
                        user_id: conv.user_id,
                        nickname: conv.nickname,
                        gender: conv.gender || 'unknown',
                        age: conv.age || 0,
                        country: conv.country || 'Unknown',
                        online: false
                      };
                    }
                    selectUser(user);
                    showHistorySidebar = false;
                  }}
                  class="w-full text-left p-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg cursor-pointer transition-colors"
                >
                  <div class="flex items-center justify-between mb-1">
                    <p class="font-medium text-neutral-900 dark:text-white">{conv.nickname}</p>
                    <span class="text-xs text-neutral-500 dark:text-neutral-400">{new Date(conv.last_message_time).toLocaleTimeString()}</span>
                  </div>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400 truncate">{conv.last_message}</p>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Filter Modal -->
    {#if showFilterModal}
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showFilterModal = false}>
        <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full p-6" on:click|stopPropagation>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-neutral-900 dark:text-white">Filter Users</h3>
            <button
              on:click={() => showFilterModal = false}
              class="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-6">
            <!-- Gender Filter -->
            <div>
              <label class="block text-sm font-medium text-neutral-900 dark:text-white mb-3">Gender</label>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterGender.includes('male')}
                    on:change={(e) => {
                      if (e.currentTarget.checked) {
                        filterGender = [...filterGender, 'male'];
                      } else {
                        filterGender = filterGender.filter(g => g !== 'male');
                      }
                    }}
                    class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-secondary-500 focus:ring-secondary-500"
                  />
                  <span class="text-sm text-neutral-700 dark:text-neutral-300">Male</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterGender.includes('female')}
                    on:change={(e) => {
                      if (e.currentTarget.checked) {
                        filterGender = [...filterGender, 'female'];
                      } else {
                        filterGender = filterGender.filter(g => g !== 'female');
                      }
                    }}
                    class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-secondary-500 focus:ring-secondary-500"
                  />
                  <span class="text-sm text-neutral-700 dark:text-neutral-300">Female</span>
                </label>
              </div>
            </div>

            <!-- Age Range Filter -->
            <div>
              <label class="block text-sm font-medium text-neutral-900 dark:text-white mb-3">
                Age Range: {filterAgeMin} - {filterAgeMax}
              </label>
              <div class="relative h-8 flex items-center">
                <div class="absolute w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg">
                  <div
                    class="absolute h-2 bg-secondary-500 rounded-lg"
                    style="left: {((filterAgeMin - 18) / (90 - 18)) * 100}%; right: {100 - ((filterAgeMax - 18) / (90 - 18)) * 100}%;"
                  ></div>
                </div>
                <input
                  type="range"
                  min="18"
                  max="90"
                  bind:value={filterAgeMin}
                  on:input={() => {
                    if (filterAgeMin > filterAgeMax) {
                      filterAgeMin = filterAgeMax;
                    }
                  }}
                  class="absolute w-full appearance-none bg-transparent cursor-pointer range-slider"
                  style="pointer-events: none;"
                  on:pointerdown={(e) => e.currentTarget.style.pointerEvents = 'all'}
                  on:pointerup={(e) => e.currentTarget.style.pointerEvents = 'none'}
                />
                <input
                  type="range"
                  min="18"
                  max="90"
                  bind:value={filterAgeMax}
                  on:input={() => {
                    if (filterAgeMax < filterAgeMin) {
                      filterAgeMax = filterAgeMin;
                    }
                  }}
                  class="absolute w-full appearance-none bg-transparent cursor-pointer range-slider"
                  style="pointer-events: none;"
                  on:pointerdown={(e) => e.currentTarget.style.pointerEvents = 'all'}
                  on:pointerup={(e) => e.currentTarget.style.pointerEvents = 'none'}
                />
              </div>
              <div class="flex justify-between mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                <span>Min: {filterAgeMin}</span>
                <span>Max: {filterAgeMax}</span>
              </div>
            </div>

            <!-- Country Filter -->
            <div>
              <label class="block text-sm font-medium text-neutral-900 dark:text-white mb-3">
                Country {filterCountries.length > 0 ? `(${filterCountries.length}/4)` : ''}
              </label>
              <div class="max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg">
                {#each Object.entries(countryCodeToName).sort((a, b) => a[1].localeCompare(b[1])) as [code, name]}
                  <label class="flex items-center gap-2 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterCountries.includes(code)}
                      disabled={!filterCountries.includes(code) && filterCountries.length >= 4}
                      on:change={(e) => {
                        if (e.currentTarget.checked) {
                          if (filterCountries.length < 4) {
                            filterCountries = [...filterCountries, code];
                          }
                        } else {
                          filterCountries = filterCountries.filter(c => c !== code);
                        }
                      }}
                      class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-secondary-500 focus:ring-secondary-500"
                    />
                    <CountryFlag countryCode={code} size="sm" />
                    <span class="text-sm text-neutral-700 dark:text-neutral-300">{name}</span>
                  </label>
                {/each}
              </div>
            </div>

            <!-- Clear Filter Button -->
            <button
              on:click={() => {
                filterGender = [];
                filterAgeMin = 18;
                filterAgeMax = 90;
                filterCountries = [];
              }}
              disabled={!hasActiveFilters}
              class="w-full py-2 px-4 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Custom scrollbar styling */
  :global(*::-webkit-scrollbar) {
    width: 6px;
    height: 6px;
  }

  :global(*::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(*::-webkit-scrollbar-thumb) {
    background: rgb(20 184 166);
    border-radius: 3px;
  }

  :global(*::-webkit-scrollbar-thumb:hover) {
    background: rgb(13 148 136);
  }

  /* Firefox scrollbar */
  :global(*) {
    scrollbar-width: thin;
    scrollbar-color: rgb(20 184 166) transparent;
  }

  /* Range slider styling */
  :global(.range-slider::-webkit-slider-thumb) {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgb(20 184 166);
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    pointer-events: all;
  }

  :global(.range-slider::-moz-range-thumb) {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgb(20 184 166);
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    pointer-events: all;
  }

  :global(.range-slider::-webkit-slider-runnable-track) {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    height: 2px;
  }

  :global(.range-slider::-moz-range-track) {
    background: transparent;
    height: 2px;
  }
</style>
