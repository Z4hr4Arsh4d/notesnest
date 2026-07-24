require("dotenv").config();
const { neonConfig } = require("@neondatabase/serverless");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { PrismaClient } = require("@prisma/client");
const ws = require("ws");

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // create a test user with two notes, all in one go (a "nested write")
  const user = await prisma.user.create({
    data: {
      email: "zahra@example.com",
      name: "Zahra",
      passwordHash: "placeholder-we-hash-properly-on-day-3",
      notes: {
        create: [
          { title: "Welcome to NotesNest", content: "This is my first note!" },
          { title: "Todo", content: "Build the rest of the app." },
        ],
      },
    },
    include: { notes: true },   // return the notes too, so we can log them
  });

  console.log("Created user:", user.email);
  console.log("With notes:", user.notes.map((n) => n.title));
}

main()
  .catch((e) => console.error("Seed failed:", e))
  .finally(() => process.exit());