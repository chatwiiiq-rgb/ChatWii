<script lang="ts">
  import { goto } from '$app/navigation';
  import ThemeToggle from '$lib/components/shared/ThemeToggle.svelte';
  import Footer from '$lib/components/shared/Footer.svelte';
</script>

<svelte:head>
  <title>Privacy Policy - ChatWii</title>
</svelte:head>

<div class="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col">
  <!-- Header -->
  <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 h-16 px-6 flex items-center justify-between">
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
      <img src="/logo/logo.png" alt="ChatWii" class="h-10 w-auto" />
    </div>
    <ThemeToggle />
  </header>

  <!-- Main Content -->
  <main class="container mx-auto px-4 py-12 flex-1">
    <div class="max-w-4xl mx-auto">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <svg class="w-16 h-16 text-secondary-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <h1 class="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
          Privacy Policy
        </h1>
        <p class="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          Your privacy is our top priority. Learn how we protect your data and maintain your anonymity on ChatWii.
        </p>
        <div class="mt-6 text-sm text-neutral-500 dark:text-neutral-500">
          Last updated: January 9, 2025
        </div>
      </div>

      <!-- Key Points -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 text-center border border-neutral-200 dark:border-neutral-700">
          <svg class="w-8 h-8 text-primary-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <h3 class="font-semibold text-neutral-900 dark:text-white mb-2">No Tracking</h3>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            We don't track your browsing or collect analytics
          </p>
        </div>
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 text-center border border-neutral-200 dark:border-neutral-700">
          <svg class="w-8 h-8 text-danger-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <h3 class="font-semibold text-neutral-900 dark:text-white mb-2">Auto-Delete</h3>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            Messages are automatically deleted after 24 hours
          </p>
        </div>
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 text-center border border-neutral-200 dark:border-neutral-700">
          <svg class="w-8 h-8 text-emerald-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 class="font-semibold text-neutral-900 dark:text-white mb-2">Encrypted</h3>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            All communications are encrypted in transit
          </p>
        </div>
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 text-center border border-neutral-200 dark:border-neutral-700">
          <svg class="w-8 h-8 text-secondary-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 class="font-semibold text-neutral-900 dark:text-white mb-2">Anonymous</h3>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            No personal information required
          </p>
        </div>
      </div>

      <!-- Detailed Policy -->
      <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 md:p-12 space-y-8">

        <!-- Data Collection -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            1. What Information We Collect
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p>
              <strong class="text-neutral-900 dark:text-neutral-100">Minimal Data Only:</strong> We collect only the absolute minimum information needed to provide our service:
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Chosen nickname (not linked to your identity)</li>
              <li>Selected gender and age range (for matching preferences)</li>
              <li>Country (detected automatically for regional matching)</li>
              <li>Chat messages (automatically deleted after 24 hours)</li>
            </ul>
            <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <p class="text-emerald-800 dark:text-emerald-200">
                <strong>✓ We Never Collect:</strong> Email addresses, phone numbers, real names, IP addresses (except for rate limiting), device fingerprints, or any personally identifiable information.
              </p>
            </div>
          </div>
        </section>

        <!-- How We Use Data -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            2. How We Use Your Information
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <ul class="list-disc pl-6 space-y-2">
              <li>Enable anonymous chat functionality</li>
              <li>Match users based on preferences and availability</li>
              <li>Maintain basic safety and moderation</li>
              <li>Detect and prevent abuse or spam</li>
            </ul>
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p class="text-blue-800 dark:text-blue-200">
                <strong>Important:</strong> We never use your data for advertising, marketing, or commercial purposes. We don't sell, rent, or share your information with third parties.
              </p>
            </div>
          </div>
        </section>

        <!-- Message Privacy -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            3. Message Privacy & Deletion
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Automatic Deletion:</strong> All messages are permanently deleted after 24 hours</li>
              <li><strong>No Permanent Storage:</strong> We don't create backups or archives of your conversations</li>
              <li><strong>Encrypted Transit:</strong> All messages are encrypted while being transmitted</li>
              <li><strong>No Message Scanning:</strong> We don't read, analyze, or process your messages for commercial purposes</li>
            </ul>
            <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p class="text-purple-800 dark:text-purple-200">
                <strong>Exception:</strong> Messages may be temporarily retained only when reported for safety violations, and only for the time needed for moderation review.
              </p>
            </div>
          </div>
        </section>

        <!-- Cookies & Tracking -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            4. Cookies & Tracking
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies Only:</strong> We only use cookies necessary for the service to function</li>
              <li><strong>No Analytics:</strong> We don't use Google Analytics or similar tracking services</li>
              <li><strong>No Third-Party Trackers:</strong> No social media pixels, advertising trackers, or data brokers</li>
              <li><strong>Local Storage:</strong> Some preferences (like dark mode) are stored locally on your device</li>
            </ul>
          </div>
        </section>

        <!-- Data Security -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            5. Data Security
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Encryption:</strong> All data is encrypted in transit using industry-standard protocols</li>
              <li><strong>Secure Infrastructure:</strong> Hosted on secure, reputable cloud infrastructure</li>
              <li><strong>Access Controls:</strong> Strict access controls limit who can access any data</li>
              <li><strong>Regular Security Updates:</strong> We maintain up-to-date security practices</li>
            </ul>
          </div>
        </section>

        <!-- Your Rights -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            6. Your Rights
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Complete Anonymity:</strong> You can use our service completely anonymously</li>
              <li><strong>No Account Required:</strong> No registration, verification, or account creation needed</li>
              <li><strong>Leave Anytime:</strong> Simply close your browser - no data persists</li>
              <li><strong>Report Issues:</strong> Use our feedback system to report privacy concerns</li>
            </ul>
            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p class="text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> Since we don't store personal data, traditional "data deletion" requests aren't applicable - your data is already automatically deleted.
              </p>
            </div>
          </div>
        </section>

        <!-- Children's Privacy -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            7. Children's Privacy
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p>
              Our service is intended for users 18 years and older. We require age selection during registration and don't knowingly collect information from minors. If you believe a minor has used our service, please contact us through our feedback system.
            </p>
          </div>
        </section>

        <!-- International Users -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            8. International Users
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p>
              ChatWii is available globally. We comply with international privacy laws including GDPR, CCPA, and other applicable regulations. Our minimal data collection approach means we exceed most privacy requirements by default.
            </p>
          </div>
        </section>

        <!-- Changes to Policy -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            9. Changes to This Policy
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p>
              We may update this privacy policy occasionally. Any changes will be posted on this page with an updated revision date. Continued use of ChatWii after changes indicates acceptance of the updated policy.
            </p>
          </div>
        </section>

        <!-- Contact -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            10. Contact Us
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p>
              If you have questions about this privacy policy or our privacy practices, please use our feedback system accessible from the main chat interface or after logging out.
            </p>
          </div>
        </section>

      </div>
    </div>
  </main>

  <Footer />
</div>
