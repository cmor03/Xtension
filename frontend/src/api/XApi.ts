import { XAPICredentials } from '@/types';

class XApi {
  private baseUrl = 'https://api.twitter.com/2';
  private credentials: XAPICredentials | null = null;

  constructor(credentials: XAPICredentials | null) {
    this.credentials = credentials;
  }

  private async fetchFromTwitter(endpoint: string, params: Record<string, string>) {
    if (!this.credentials || !this.credentials.bearerToken) {
      throw new Error('Bearer token is not set');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.credentials.bearerToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async searchTweets(query: string, maxResults: number = 10) {
    const params = {
      query: query,
      max_results: maxResults.toString(),
      'tweet.fields': 'author_id,created_at,text',
      expansions: 'author_id',
      'user.fields': 'name,username,profile_image_url',
    };

    return this.fetchFromTwitter('/tweets/search/recent', params);
  }

  setCredentials(credentials: XAPICredentials | null) {
    this.credentials = credentials;
  }
}

export default XApi;
