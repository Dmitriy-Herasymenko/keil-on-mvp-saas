import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

const TEST_USERS = [
  { email: "user1@gmail.com", password: "user123", name: "Олександр" },
  { email: "user2@gmail.com", password: "user123", name: "Марія" },
  { email: "user3@gmail.com", password: "user123", name: "Іван" },
  { email: "user4@gmail.com", password: "user123", name: "Анна" },
  { email: "user5@gmail.com", password: "user123", name: "Дмитро" },
  { email: "user6@gmail.com", password: "user123", name: "Катерина" },
  { email: "user7@gmail.com", password: "user123", name: "Максим" },
  { email: "user8@gmail.com", password: "user123", name: "Софія" },
  { email: "user9@gmail.com", password: "user123", name: "Артем" },
  { email: "user10@gmail.com", password: "user123", name: "Вікторія" },
];

export async function seedUsers() {
  console.log("Seeding users...");
  
  for (const user of TEST_USERS) {
    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, user.email),
    });
    
    if (!existing) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await db.insert(users).values({
        email: user.email,
        password: hashedPassword,
        name: user.name,
      });
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }
  
  console.log("Seeding complete!");
}

if (require.main === module) {
  seedUsers().catch(console.error);
}
