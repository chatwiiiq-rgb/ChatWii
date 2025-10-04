<script lang="ts">
  import { goto } from '$app/navigation';
  import ThemeToggle from '$lib/components/shared/ThemeToggle.svelte';
  import Footer from '$lib/components/shared/Footer.svelte';
</script>

<svelte:head>
  <title>How It Works - ChatWii</title>
</svelte:head>

<div class="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col">
  <!-- Header -->
  <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <button
        on:click={() => goto('/')}
        class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Go back to home"
      >
        <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <img src="/logo/logo.png" alt="ChatWii" class="h-8 sm:h-10 w-auto" />
    </div>
    <ThemeToggle />
  </header>

  <!-- Main Content -->
  <main class="container mx-auto px-4 py-4 sm:py-6 sm:py-8 md:py-12 flex-1">
    <div class="max-w-4xl mx-auto">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <svg class="w-16 h-16 text-secondary-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 class="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
          How It Works
        </h1>
        <p class="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          Get started with ChatWii in just a few simple steps. Anonymous, secure, and private conversations are just moments away.
        </p>
      </div>

      <!-- Getting Started Steps -->
      <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 md:p-12 mb-16">
        <h2 class="text-3xl font-bold text-neutral-900 dark:text-white mb-8 text-center">
          🚀 Getting Started
        </h2>

        <div class="space-y-8">
          <!-- Step 1 -->
          <div class="flex items-start gap-6">
            <div class="flex-shrink-0 w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-lg">1</span>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Choose Your Anonymous Identity
              </h3>
              <p class="text-neutral-600 dark:text-neutral-400 mb-4">
                Create a nickname, select your gender, age range, and we'll detect your country. No email, phone number, or real name required - stay completely anonymous.
              </p>
              <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  💡 <strong>Tip:</strong> Use our random nickname generator for creative suggestions, or create your own unique identity!
                </p>
              </div>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="flex items-start gap-6">
            <div class="flex-shrink-0 w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-lg">2</span>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Enter the Chat Interface
              </h3>
              <p class="text-neutral-600 dark:text-neutral-400 mb-4">
                Click "Start Chat" and you'll be instantly connected to our global community. See who's online, filter by preferences, and start conversations.
              </p>
              <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  🌍 <strong>Global Community:</strong> Connect with people from around the world, each represented by their chosen avatar and nickname.
                </p>
              </div>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="flex items-start gap-6">
            <div class="flex-shrink-0 w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-lg">3</span>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Start Meaningful Conversations
              </h3>
              <p class="text-neutral-600 dark:text-neutral-400 mb-4">
                Send messages, share images, use emojis, and have real-time conversations. Each chat is private and secure between you and the other person.
              </p>
              <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  💬 <strong>Chat Features:</strong> Text messages, image sharing (20 images per day), emoji picker, and more - all anonymous and secure.
                </p>
              </div>
            </div>
          </div>

          <!-- Step 4 -->
          <div class="flex items-start gap-6">
            <div class="flex-shrink-0 w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-lg">4</span>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Leave Anytime, No Traces
              </h3>
              <p class="text-neutral-600 dark:text-neutral-400 mb-4">
                When you're done chatting, simply log out. No account to delete, no data to worry about - your anonymity remains intact.
              </p>
              <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  🗑️ <strong>Auto-Cleanup:</strong> All messages automatically delete after 24 hours. No permanent records, no data storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Features -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
          <svg class="w-12 h-12 text-primary-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            No Registration
          </h3>
          <p class="text-neutral-600 dark:text-neutral-400">
            Jump straight into conversations without creating accounts, providing emails, or going through verification processes.
          </p>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
          <svg class="w-12 h-12 text-secondary-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            Real-Time Messaging
          </h3>
          <p class="text-neutral-600 dark:text-neutral-400">
            Send text, images, and emojis in real-time. See who's online, typing indicators, and instant message delivery.
          </p>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
          <svg class="w-12 h-12 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            Global Reach
          </h3>
          <p class="text-neutral-600 dark:text-neutral-400">
            Connect with people from every country and culture. Filter by gender, age, and country to find your perfect chat partner.
          </p>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
          <svg class="w-12 h-12 text-warning-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            Built-in Safety
          </h3>
          <p class="text-neutral-600 dark:text-neutral-400">
            Block users, report inappropriate behavior, and use moderation tools to maintain a safe environment.
          </p>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
          <svg class="w-12 h-12 text-danger-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            Auto-Delete
          </h3>
          <p class="text-neutral-600 dark:text-neutral-400">
            Messages disappear automatically after 24 hours. Nothing is permanently stored or archived.
          </p>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
          <svg class="w-12 h-12 text-purple-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            Customizable
          </h3>
          <p class="text-neutral-600 dark:text-neutral-400">
            Choose dark or light themes, filter users by preferences, and personalize your chat experience.
          </p>
        </div>
      </div>

      <!-- Chat Interface Preview -->
      <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 md:p-12 mb-16">
        <h2 class="text-3xl font-bold text-neutral-900 dark:text-white mb-8 text-center">
          💬 Chat Interface
        </h2>

        <div class="space-y-6">
          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
              <h3 class="font-bold text-neutral-900 dark:text-white mb-3">👥 User List</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                See who's online with their chosen avatars and nicknames. Filter by gender, age, and country. Click to start private conversations.
              </p>
            </div>

            <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
              <h3 class="font-bold text-neutral-900 dark:text-white mb-3">💬 Chat Area</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                One-on-one private conversations. Messages appear instantly with timestamps. Only you and the other person can see these messages.
              </p>
            </div>

            <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
              <h3 class="font-bold text-neutral-900 dark:text-white mb-3">📨 Message Input</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Type messages, insert emojis, share images. Character limit displayed. Rate limiting for safety (25 messages per minute).
              </p>
            </div>
          </div>

          <div class="bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-neutral-700 dark:to-neutral-700 rounded-lg p-6">
            <h3 class="font-bold text-neutral-900 dark:text-white mb-3 text-center">
              🎯 Message Features
            </h3>
            <div class="grid md:grid-cols-2 gap-4 text-sm">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-secondary-600 dark:text-secondary-400">📝</span>
                  <span class="text-neutral-700 dark:text-neutral-300">Type and send text messages (160 char limit)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-secondary-600 dark:text-secondary-400">🖼️</span>
                  <span class="text-neutral-700 dark:text-neutral-300">Share images (20 images per day)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-secondary-600 dark:text-secondary-400">😀</span>
                  <span class="text-neutral-700 dark:text-neutral-300">Insert emojis with picker</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-secondary-600 dark:text-secondary-400">🔍</span>
                  <span class="text-neutral-700 dark:text-neutral-300">Filter users by preferences</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-secondary-600 dark:text-secondary-400">🚫</span>
                  <span class="text-neutral-700 dark:text-neutral-300">Block and report users</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-secondary-600 dark:text-secondary-400">📜</span>
                  <span class="text-neutral-700 dark:text-neutral-300">View conversation history</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Privacy & Security -->
      <div class="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 md:p-12 mb-16 text-white">
        <div class="text-center mb-8">
          <svg class="w-16 h-16 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h2 class="text-3xl font-bold mb-4">Privacy & Security First</h2>
          <p class="text-xl opacity-90 max-w-2xl mx-auto">
            Your safety and privacy are built into every aspect of ChatWii
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h3 class="text-xl font-bold mb-4">🔒 What We Protect</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-white/80">✓</span>
                <span>Your real identity stays completely hidden</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-white/80">✓</span>
                <span>No personal information is collected or stored</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-white/80">✓</span>
                <span>Messages are encrypted during transmission</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-white/80">✓</span>
                <span>Automatic deletion prevents data accumulation</span>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-bold mb-4">🛡️ How We Keep You Safe</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-white/80">✓</span>
                <span>Real-time moderation and reporting system</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-white/80">✓</span>
                <span>Instant blocking prevents unwanted contact</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-white/80">✓</span>
                <span>Rate limiting prevents spam and abuse</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-white/80">✓</span>
                <span>No ads or tracking means no data mining</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 md:p-12">
        <h2 class="text-3xl font-bold text-neutral-900 dark:text-white mb-8 text-center">
          ❓ Frequently Asked Questions
        </h2>

        <div class="space-y-8">
          <div>
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Is ChatWii really free?
            </h3>
            <p class="text-neutral-600 dark:text-neutral-400">
              Yes, completely free. No hidden costs, premium features, or subscription fees. We believe everyone deserves access to anonymous, safe communication.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Do I need to create an account?
            </h3>
            <p class="text-neutral-600 dark:text-neutral-400">
              No account needed! Just choose a nickname, select your gender and age, and you're ready to chat. This maintains your anonymity and makes getting started instant.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Can other users find out who I really am?
            </h3>
            <p class="text-neutral-600 dark:text-neutral-400">
              No, your real identity is completely protected. Other users only see your chosen nickname and avatar. We don't collect or display personal information.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              What happens to my messages?
            </h3>
            <p class="text-neutral-600 dark:text-neutral-400">
              All messages automatically delete after 24 hours. We don't create backups, archives, or permanent records of conversations.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              How do I report inappropriate behavior?
            </h3>
            <p class="text-neutral-600 dark:text-neutral-400">
              Click the three-dot menu next to any user's name to access the report function. Our moderation team reviews all reports quickly and takes appropriate action.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Can I use ChatWii on mobile devices?
            </h3>
            <p class="text-neutral-600 dark:text-neutral-400">
              Yes! ChatWii works on any device with a web browser - phones, tablets, computers, and more. The interface is fully responsive and optimized for all screen sizes.
            </p>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="text-center mt-16">
        <div class="bg-gradient-to-r from-secondary-500 to-primary-500 rounded-2xl p-8 md:p-12 text-white">
          <svg class="w-16 h-16 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 class="text-3xl font-bold mb-4">Ready to Start Chatting?</h2>
          <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of people having meaningful conversations right now. Anonymous, safe, and completely free.
          </p>
          <button
            on:click={() => goto('/')}
            class="bg-white text-primary-600 font-bold py-4 px-8 rounded-lg hover:bg-neutral-100 transition-colors text-lg"
          >
            Start Chatting Now →
          </button>
        </div>
      </div>

    </div>
  </main>

  <Footer />
</div>
