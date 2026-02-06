import amqplib from "amqplib";
import { redisClient } from "../server.js";
import { sql } from "./db.js";
interface CacheInvalidationMessage {
  action: string;
  keys: string[];
}

export const startCacheConsumer = async () => {
  try {
    // const url = "amqp://guest:guest@localhost:5672";
    // const url = "amqp://admin:admin123@localhost:5672";
    // const url = "amqp://admin:admin123@13.60.87.246:5672";
    const url = process.env.RABBITMQ_URL as string;

    if (!url) {
      throw new Error("RABBITMQ_URL is not set");
    }
    const connection = await amqplib.connect(url);

    const channel = await connection.createChannel();

    const queueName = "cache-invalidation";

    await channel.assertQueue(queueName, { durable: true });

    console.log("✔ BLog Service cache consumer started");

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(
            msg.content.toString()
          ) as CacheInvalidationMessage;

          console.log(
            "blog service received cache invalidation message:",
            content
          );

          if (content.action === "invalidateCache") {
            for (const pattern of content.keys) {
              const keys = await redisClient.keys(pattern);

              if (keys.length > 0) {
                await redisClient.del(keys);

                console.log(
                  `🗑 blog service invalidated ${keys.length} cache keys matching: ${pattern}`
                );

                const category = "";
                const searchQuery = "";

                const cacheKey = `blogs:${searchQuery}:${category}`;

                const blogs =
                  await sql`SELECT * FROM blogs ORDER BY create_at DESC`;

                await redisClient.set(cacheKey, JSON.stringify(blogs), {
                  EX: 3600,
                });

                console.log("🔄 cache rebuilt with key:", cacheKey);
              }
            }
          }
          channel.ack(msg);
        } catch (error) {
          console.error(
            "❌ Error processing cache invalidation in blog service:",
            error
          );
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    console.error("❌Failed to start rabbitmq consumer:", error);
  }
};
