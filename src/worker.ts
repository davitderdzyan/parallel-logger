import Database from "better-sqlite3";
import amqp from "amqplib";
import path from "path";
import {db } from "./db";
db.prepare("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, message TEXT, timestamp TEXT)").run();

const QUEUE_NAME = "logs";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672";

async function startConsumer() {
  let channel: amqp.Channel | null = null;

  while (!channel) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      channel = await conn.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log("Consumer connected to RabbitMQ");
    } catch {
      console.log("RabbitMQ not ready, retrying...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  channel.consume(QUEUE_NAME, (msg) => {
    if (msg) {
      console.log("Received log:", msg.content.toString());
      const { message, timestamp } = JSON.parse(msg.content.toString());
      db.prepare("INSERT INTO logs (message, timestamp) VALUES (?, ?)").run(message, timestamp);
      console.log("Saved log:", message);
      channel!.ack(msg);
    }
  });
}

startConsumer();
