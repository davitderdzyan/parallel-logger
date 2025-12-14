import http from "http";
import amqp from "amqplib";
import { db } from "./db";
const PORT = 4000;
const QUEUE_NAME = "logs";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672";

db.prepare("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, message TEXT, timestamp TEXT)").run();

async function startWorker() {
  let channel: amqp.Channel | null = null;

  while (!channel) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      channel = await conn.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log("Worker connected to RabbitMQ");
    } catch {
      console.log("RabbitMQ not ready, retrying...");
      await new Promise(r => setTimeout(r, 2000));
    }
    console.log("Still in loop...");
  }


  const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/log") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", () => {
        try {
          const { message } = JSON.parse(body);
          const timestamp = new Date().toISOString();
          channel!.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify({ message, timestamp })), { persistent: true });
          res.writeHead(200);
          res.end("Logged\n");
        } catch {
          res.writeHead(400);
          res.end("Invalid JSON\n");
        }
      });
    } else if (req.method === "GET" && req.url === "/logs") {
      const logs = db.prepare("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100").all();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(logs));
    } else {
      res.writeHead(404);
      res.end("Not Found\n");
    }
  });

  server.listen(PORT, () => console.log(`Worker HTTP server running on port ${PORT}`));
}

startWorker();
