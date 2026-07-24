require("dotenv").config();
const { neonConfig, Pool } = require("@neondatabase/serverless");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { PrismaClient } = require("@prisma/client");
const ws = require("ws");

// Neon's driver needs a WebSocket implementation in Node
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
console.log("Using URL starting with:", connectionString.slice(0, 30));

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.$queryRaw`SELECT 1 as ok`;
  console.log("Connected over HTTPS! Result:", result);
}

main()
  .catch((e) => console.error("Failed:", e))
  .finally(() => process.exit());