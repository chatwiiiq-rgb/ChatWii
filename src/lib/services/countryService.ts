/**
 * Detects user's country using Cloudflare headers (primary) and IPAPI fallback
 */
export class CountryService {
  private static detectedCountry: string | null = null;

  /**
   * Get country from server-side (Cloudflare headers)
   */
  static async getCountryFromServer(): Promise<string> {
    try {
      const response = await fetch('/api/detect-country');
      if (response.ok) {
        const data = await response.json();
        if (data.country) {
          this.detectedCountry = data.country.toLowerCase();
          return this.detectedCountry;
        }
      }
    } catch (error) {
      console.error('Failed to get country from server:', error);
    }

    // Fallback to IPAPI
    return this.getCountryFromIPAPI();
  }

  /**
   * Fallback: Get country from IPAPI
   */
  private static async getCountryFromIPAPI(): Promise<string> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        if (data.country_code) {
          this.detectedCountry = data.country_code.toLowerCase();
          return this.detectedCountry;
        }
      }
    } catch (error) {
      console.error('Failed to get country from IPAPI:', error);
    }

    // Ultimate fallback
    return 'us';
  }

  /**
   * Get cached country or detect new one
   */
  static async getCountry(): Promise<string> {
    if (this.detectedCountry) {
      return this.detectedCountry;
    }
    return this.getCountryFromServer();
  }
}
