import { TwitterApi } from 'twitter-api-v2';

class XApi {
  private client: TwitterApi | null = null;

  constructor(
    private apiKey: string | null,
    private apiSecretKey: string | null,
    private accessToken: string | null,
    private accessTokenSecret: string | null
  ) {
    this.initClient();
  }

  private initClient() {
    if (this.apiKey && this.apiSecretKey && this.accessToken && this.accessTokenSecret) {
      this.client = new TwitterApi({
        appKey: this.apiKey,
        appSecret: this.apiSecretKey,
        accessToken: this.accessToken,
        accessSecret: this.accessTokenSecret,
      });
    } else {
      this.client = null;
    }
  }

  async tweet(text: string): Promise<any> {
    if (!this.client) {
      throw new Error('X API client is not initialized');
    }
    try {
      const response = await this.client.v2.tweet(text);
      return response;
    } catch (error) {
      console.error('Error posting tweet:', error);
      throw error;
    }
  }

  async getUserInfo(username: string): Promise<any> {
    if (!this.client) {
      throw new Error('X API client is not initialized');
    }
    try {
      const response = await this.client.v2.userByUsername(username);
      return response;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }
}

export default XApi;