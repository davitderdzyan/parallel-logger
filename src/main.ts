import { Worker } from "worker_threads";
import fs from "fs";
import path from "path";

const logFile = path.join(__dirname, "logs.txt");
const workerPath = path.resolve(__dirname, "worker.ts");
const worker = new Worker(workerPath, {
  execArgv: ["-r", "ts-node/register"],
});

let writing = false;
const logQueue: string[] = [];

// Listen for logs from the worker
worker.on("message", async (msg) => {
  if (msg.type === "log") {
    logQueue.push(msg.data);
    await processQueue();
  }
});

async function processQueue() {
  if (writing) return;
  writing = true;

  while (logQueue.length > 0) {
    const message = logQueue.shift()!;
    await writeToFile(message);
  }

  writing = false;
}

function writeToFile(message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.appendFile(logFile, message + "\n", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

console.log("Main logger started. Waiting for log messages...");
