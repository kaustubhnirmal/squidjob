import { db } from "./db";
import { users } from "@shared/schema";
import { count } from "drizzle-orm";
import bcrypt from "bcrypt";

const seed = async () => {
  try {
    // Set a timeout for seeding process
    const seedTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Seed timeout')), 5000)
    );
    
    const seedProcess = async () => {
      const existingUsers = await db.select({ value: count() }).from(users);
      if (existingUsers[0].value > 0) {
        console.log("Database already has users. Skipping seed.");
        return;
      }

      console.log("Seeding database with initial admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 12);
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        email: "admin@tender247.com",
        name: "Admin User",
        role: "Admin",
        department: "Administration",
        designation: "System Administrator",
        status: "Active"
      });
      
      console.log("Admin user created successfully");
    };
    
    await Promise.race([seedProcess(), seedTimeout]);
  } catch (error) {
    console.error("Error seeding database:", error);
    // Don't throw error - let server continue without seeding
  }
};

export default seed;