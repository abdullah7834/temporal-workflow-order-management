import path = require('node:path');
import { Worker, NativeConnection } from '@temporalio/worker';

async function run() {
  const address = process.env.TEMPORAL_ADDRESS || '127.0.0.1:7233';
  console.log(`[worker] Connecting to Temporal at ${address}`);
  let connection: NativeConnection | null = null;
  const maxAttempts = 30;
  let attempt = 0;
  while (!connection && attempt < maxAttempts) {
    attempt += 1;
    try {
      connection = await NativeConnection.connect({ address });
    } catch (err) {
      const delayMs = Math.min(5000, 250 * attempt);
      console.warn(`[worker] Connection failed (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  if (!connection) {
    throw new Error(`[worker] Could not connect to Temporal at ${address} after ${maxAttempts} attempts.`);
  }
  const worker = await Worker.create({
    connection,
    workflowsPath: path.join(__dirname, 'workflows'),
    activities: require('./activities'),
    taskQueue: 'order-task-queue'
  });
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


