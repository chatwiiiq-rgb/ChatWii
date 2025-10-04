<script lang="ts">
  import { goto } from '$app/navigation';
  import ThemeToggle from '$lib/components/shared/ThemeToggle.svelte';
  import Footer from '$lib/components/shared/Footer.svelte';
</script>

<svelte:head>
  <title>Safety Guide - ChatWii</title>
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
        <svg class="w-16 h-16 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <h1 class="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
          Safety Guide
        </h1>
        <p class="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          Your safety is our top priority. Learn how to have positive, secure conversations and protect yourself while using ChatWii.
        </p>
      </div>

      <!-- Quick Safety Tips -->
      <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 mb-12">
        <h2 class="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-6 text-center">
          🛡️ Quick Safety Reminders
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="text-emerald-600 dark:text-emerald-400">✓</span>
              <span class="text-emerald-800 dark:text-emerald-200">Never share personal information</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-emerald-600 dark:text-emerald-400">✓</span>
              <span class="text-emerald-800 dark:text-emerald-200">Use the block feature if someone makes you uncomfortable</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-emerald-600 dark:text-emerald-400">✓</span>
              <span class="text-emerald-800 dark:text-emerald-200">Report inappropriate behavior immediately</span>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="text-emerald-600 dark:text-emerald-400">✓</span>
              <span class="text-emerald-800 dark:text-emerald-200">Trust your instincts - leave if something feels wrong</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-emerald-600 dark:text-emerald-400">✓</span>
              <span class="text-emerald-800 dark:text-emerald-200">Remember conversations are temporary and anonymous</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-emerald-600 dark:text-emerald-400">✓</span>
              <span class="text-emerald-800 dark:text-emerald-200">Be respectful and kind to others</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Safety Features -->
      <div class="grid md:grid-cols-3 gap-8 mb-12">
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
          <svg class="w-12 h-12 text-danger-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
          <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            Report System
          </h3>
          <p class="text-neutral-600 dark:text-neutral-400">
            Instantly report inappropriate behavior, harassment, or spam. Our moderation team reviews all reports quickly.
          </p>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
          <svg class="w-12 h-12 text-warning-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            Block Users
          </h3>
          <p class="text-neutral-600 dark:text-neutral-400">
            Immediately block any user who makes you uncomfortable. They won't be able to contact you again.
          </p>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
          <svg class="w-12 h-12 text-primary-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
          <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            Complete Anonymity
          </h3>
          <p class="text-neutral-600 dark:text-neutral-400">
            Your real identity is never revealed. Chat freely without worrying about personal information exposure.
          </p>
        </div>
      </div>

      <!-- Detailed Guidelines -->
      <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 md:p-12 space-y-8">

        <!-- Personal Information -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-3">
            <svg class="w-6 h-6 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Never Share Personal Information
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p><strong class="text-neutral-900 dark:text-neutral-100">Keep these private:</strong></p>
            <div class="grid md:grid-cols-2 gap-4">
              <ul class="list-disc pl-6 space-y-2">
                <li>Real name or surname</li>
                <li>Phone number</li>
                <li>Email address</li>
                <li>Home or work address</li>
                <li>Social media profiles</li>
              </ul>
              <ul class="list-disc pl-6 space-y-2">
                <li>School or workplace name</li>
                <li>Financial information</li>
                <li>Photos of yourself</li>
                <li>Location details</li>
                <li>Family information</li>
              </ul>
            </div>
            <div class="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
              <p class="text-danger-800 dark:text-danger-200">
                <strong>⚠️ Warning:</strong> Scammers may try to build trust before asking for personal information. Never share personal details, even if someone seems friendly.
              </p>
            </div>
          </div>
        </section>

        <!-- Recognizing Red Flags -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            🚩 Recognizing Red Flags
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p><strong class="text-neutral-900 dark:text-neutral-100">Watch out for users who:</strong></p>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex items-start gap-3">
                  <span class="text-danger-500 mt-1">🚩</span>
                  <span>Ask for personal information repeatedly</span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-danger-500 mt-1">🚩</span>
                  <span>Send inappropriate or sexual messages</span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-danger-500 mt-1">🚩</span>
                  <span>Try to move conversations to other platforms</span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-danger-500 mt-1">🚩</span>
                  <span>Ask for money or financial assistance</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-start gap-3">
                  <span class="text-danger-500 mt-1">🚩</span>
                  <span>Use excessive flattery or love-bombing</span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-danger-500 mt-1">🚩</span>
                  <span>Become aggressive when told 'no'</span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-danger-500 mt-1">🚩</span>
                  <span>Share links to suspicious websites</span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-danger-500 mt-1">🚩</span>
                  <span>Try to pressure you into quick decisions</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Using Safety Features -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            🛠️ Using Safety Features
          </h2>
          <div class="space-y-6 text-neutral-700 dark:text-neutral-300">

            <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                How to Block Someone
              </h3>
              <ol class="list-decimal pl-6 space-y-2">
                <li>Click the three-dot menu next to the user's name in the chat</li>
                <li>Select "Block User" from the menu</li>
                <li>Confirm the action - they'll be blocked immediately</li>
                <li>Blocked users cannot see or contact you again</li>
              </ol>
            </div>

            <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                How to Report Someone
              </h3>
              <ol class="list-decimal pl-6 space-y-2">
                <li>Click the three-dot menu next to the user's name</li>
                <li>Select "Report User" from the menu</li>
                <li>Choose the reason for reporting (harassment, inappropriate content, spam, etc.)</li>
                <li>Provide any additional details if needed</li>
                <li>Our moderation team will review within 24 hours</li>
              </ol>
            </div>

            <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                📱 Quick Exit
              </h3>
              <p>If you ever feel unsafe, simply close your browser tab. Since ChatWii doesn't require accounts, you can leave instantly without any traces.</p>
            </div>
          </div>
        </section>

        <!-- Community Guidelines -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-3">
            <svg class="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Community Guidelines
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p><strong class="text-neutral-900 dark:text-neutral-100">Help us maintain a positive environment by:</strong></p>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-semibold text-success-600 dark:text-success-400 mb-3">✓ Do:</h4>
                <ul class="list-disc pl-6 space-y-1">
                  <li>Be respectful and kind</li>
                  <li>Use appropriate language</li>
                  <li>Respect others' boundaries</li>
                  <li>Report inappropriate behavior</li>
                  <li>Help newcomers feel welcome</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-danger-600 dark:text-danger-400 mb-3">✗ Don't:</h4>
                <ul class="list-disc pl-6 space-y-1">
                  <li>Share inappropriate content</li>
                  <li>Harass or bully others</li>
                  <li>Spam or flood chat</li>
                  <li>Share personal information</li>
                  <li>Try to scam or deceive others</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Mental Health -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            🧠 Mental Health & Well-being
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p><strong class="text-neutral-900 dark:text-neutral-100">Remember:</strong></p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Take breaks if conversations become overwhelming</li>
              <li>Don't rely solely on anonymous chats for emotional support</li>
              <li>If you're in crisis, contact professional help immediately</li>
              <li>It's okay to leave a conversation if it makes you uncomfortable</li>
            </ul>
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p class="text-blue-800 dark:text-blue-200">
                <strong>Crisis Resources:</strong> If you're in immediate danger or having thoughts of self-harm, please contact emergency services (911) or a crisis helpline in your country immediately.
              </p>
            </div>
          </div>
        </section>

        <!-- For Parents -->
        <section>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            👨‍👩‍👧‍👦 For Parents & Guardians
          </h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <p><strong class="text-neutral-900 dark:text-neutral-100">If your teen uses ChatWii:</strong></p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Discuss online safety and the importance of not sharing personal information</li>
              <li>Make sure they know they can talk to you if something makes them uncomfortable</li>
              <li>Review our safety features together</li>
              <li>Remind them that strangers online may not be who they claim to be</li>
              <li>Encourage them to trust their instincts and leave uncomfortable situations</li>
            </ul>
          </div>
        </section>

      </div>

      <!-- Emergency Contact -->
      <div class="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-2xl p-8 text-center mt-12">
        <h2 class="text-2xl font-bold text-danger-800 dark:text-danger-200 mb-4">
          🚨 Need Immediate Help?
        </h2>
        <p class="text-danger-700 dark:text-danger-300 mb-4">
          If you're in immediate danger or experiencing harassment that makes you feel unsafe:
        </p>
        <div class="space-y-2">
          <p class="font-semibold text-danger-800 dark:text-danger-200">
            • Contact local emergency services (911 in US)
          </p>
          <p class="font-semibold text-danger-800 dark:text-danger-200">
            • Use our feedback system to report urgent safety issues
          </p>
          <p class="font-semibold text-danger-800 dark:text-danger-200">
            • Block and report the user immediately
          </p>
        </div>
      </div>

    </div>
  </main>

  <Footer />
</div>
