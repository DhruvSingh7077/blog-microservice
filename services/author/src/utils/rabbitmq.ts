import amqp from "amqplib";

export let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const url = "amqp://guest:guest@localhost:5672";
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
