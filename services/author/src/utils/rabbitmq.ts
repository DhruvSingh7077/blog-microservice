import amqp from "amqplib";

export let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const url = "amqp://guest:guest@localhost:5672";
  console.log("RABBIT URL:", url);

  const connection = await amqp.connect(url);
  channel = await connection.createChannel();

  console.log("✔ RabbitMQ connected successfully");
};
