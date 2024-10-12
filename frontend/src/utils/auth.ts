const REPLEX_API_URL =
  "https://d41388c1-73da-437f-b0b7-62f215a91554-00-3577uk1dqrjza.picard.replit.dev";

export interface User {
  name: string;
  id: string;
}

export async function connectUser(connectionCode: string): Promise<User> {
  const response = await fetch(
    `${REPLEX_API_URL}/getUser?connection_code=${connectionCode}`
  );
  if (!response.ok) {
    throw new Error("Failed to authenticate");
  }
  const userData = await response.json();
  return { name: userData.userName, id: userData.userId };
}
