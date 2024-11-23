"use server";

import prisma from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function updateUsername(username: string) {
  try {
    const { userId } = await auth();
    const client = await clerkClient();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error("Username is already taken");
    }

    const updatedUser = await prisma.user.update({
      where: {
        clerkUserId: userId,
      },
      data: {
        username,
      },
    });
    await client.users.updateUser(userId, {
      username,
    });

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error: any) {
    console.log("Error updating username", error);
    throw new Error("Failed to update username", error.message);
  }
}
