import { Client, Connection } from '@temporalio/client';

let cachedClient: Client | null = null;

export async function getTemporalClient() {
  if (cachedClient) return cachedClient;
  
  const address = process.env.TEMPORAL_ADDRESS || '127.0.0.1:7233';
  console.log(`[temporal-client] Connecting to ${address}`);
  
  try {
    const connection = await Connection.connect({ address });
    cachedClient = new Client({ connection });
    console.log(`[temporal-client] Connected successfully to ${address}`);
    return cachedClient;
  } catch (error) {
    console.error(`[temporal-client] Failed to connect to ${address}:`, error);
    throw error;
  }
}


