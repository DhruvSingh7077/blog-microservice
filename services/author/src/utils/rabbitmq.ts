import amqp from "amqplib";

export let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  // const url = "amqp://guest:guest@localhost:5672";
  // const url = "amqp://admin:admin123@localhost:5672";
  // const url = "amqp://admin:admin123@13.60.87.246:5672";
  const url = process.env.RABBITMQ_URL as string;

  if (!url) {
    throw new Error("RABBITMQ_URL is not set");
  }

  console.log("RABBIT URL:", url);

  const connection = await amqp.connect(url);
  channel = await connection.createChannel();

  console.log("✔ RabbitMQ connected successfully");
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.error("Rabbitmq channel is not initialized");
    return;
  }

  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};
export const invalidateCacheJob = async (cacheKeys: string[]) => {
  try {
    const message = {
      action: "invalidateCache",
      keys: cacheKeys,
    };

    await publishToQueue("cache-invalidation", message);

    console.log("✔Cache invalidation job published:", message);
  } catch (error) {
    console.error("❌Failed to publish cache on rabbitmq:", error);
  }
};
