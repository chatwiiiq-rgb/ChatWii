// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				PUBLIC_SUPABASE_URL: string;
				PUBLIC_SUPABASE_ANON_KEY: string;
				SUPABASE_SERVICE_ROLE_KEY: string;
				PUBLIC_IMAGEKIT_PUBLIC_KEY: string;
				IMAGEKIT_PRIVATE_KEY: string;
				PUBLIC_IMAGEKIT_URL_ENDPOINT: string;
				PUBLIC_CAPTCHA_SITE_KEY: string;
				CAPTCHA_SECRET_KEY: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
