import { createClient } from "redis";

const redisClient = await createClient().connect();

export default redisClient;