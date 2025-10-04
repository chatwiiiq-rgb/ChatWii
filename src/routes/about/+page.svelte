<script lang="ts">
  import { goto } from '$app/navigation';
  import ThemeToggle from '$lib/components/shared/ThemeToggle.svelte';
  import Footer from '$lib/components/shared/Footer.svelte';
</script>

<svelte:head>
  <title>About ChatWii - Anonymous Chat Platform | Our Mission & Values</title>
  <meta name="description" content="Learn about ChatWii's mission to provide safe, anonymous conversations. Discover our commitment to privacy, respect, and meaningful connections worldwide." />
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
      <div class="text-center mb-12">
        <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
          About ChatWii
        </h1>
        <p class="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          The premier platform for anonymous, meaningful conversations with strangers worldwide.
        </p>
      </div>

      <!-- Content -->
      <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 md:p-12 space-y-8">

        <!-- Our Mission -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            Our Mission
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p>
              ChatWii was created with a simple yet powerful vision: to provide a safe, anonymous space where people from all walks of life can connect, share experiences, and have meaningful conversations without judgment or barriers.
            </p>
            <p>
              In a world where social media often demands we reveal everything about ourselves, ChatWii offers a refreshing alternative - a place where you can be yourself, express your thoughts freely, and connect with others based solely on your ideas and personality.
            </p>
          </div>
        </section>

        <!-- What Makes Us Different -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            What Makes Us Different
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>True Anonymity:</strong> No email, no phone number, no personal information required. Ever.</li>
              <li><strong>Privacy First:</strong> Messages auto-delete after 24 hours. No permanent storage, no data mining.</li>
              <li><strong>Global Community:</strong> Connect with people from every country and culture.</li>
              <li><strong>No Ads:</strong> We don't track you, sell your data, or show intrusive advertisements.</li>
              <li><strong>Built-in Safety:</strong> Comprehensive blocking and reporting tools keep conversations respectful.</li>
              <li><strong>Instant Access:</strong> No registration, verification, or waiting. Start chatting immediately.</li>
            </ul>
          </div>
        </section>

        <!-- Our Values -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            Our Values
          </h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
              <h3 class="font-bold text-neutral-900 dark:text-white mb-2">🔒 Privacy</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Your privacy is not negotiable. We collect minimal data and delete everything automatically.
              </p>
            </div>
            <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
              <h3 class="font-bold text-neutral-900 dark:text-white mb-2">🤝 Respect</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Every user deserves to be treated with dignity and respect, regardless of background.
              </p>
            </div>
            <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
              <h3 class="font-bold text-neutral-900 dark:text-white mb-2">🛡️ Safety</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Active moderation and safety tools ensure a secure environment for everyone.
              </p>
            </div>
            <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
              <h3 class="font-bold text-neutral-900 dark:text-white mb-2">🌍 Inclusivity</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                ChatWii welcomes everyone from every corner of the world, every background, every identity.
              </p>
            </div>
          </div>
        </section>

        <!-- Why Anonymous Chat -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            Why Anonymous Chat Matters
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p>
              Anonymity allows people to have conversations they might not otherwise have. It removes social barriers, encourages honesty, and creates space for genuine human connection.
            </p>
            <p>
              Whether you want to practice a new language, discuss sensitive topics, seek advice without judgment, or simply meet interesting people from around the world - ChatWii provides that safe space.
            </p>
          </div>
        </section>

        <!-- Contact -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            Get In Touch
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p>
              Have questions, suggestions, or feedback? We'd love to hear from you. Use our feedback system accessible from the main chat interface or after logging out.
            </p>
          </div>
        </section>

      </div>
    </div>
  </main>

  <Footer />
</div>
