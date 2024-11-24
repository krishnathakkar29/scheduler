"use server";

import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getUserMeetings(type: string = "upcoming") {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();

    const meetings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        startTime: type === "upcoming" ? { gte: now } : { lt: now },
      },
      include: {
        event: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: type === "upcoming" ? "asc" : "desc",
      },
    });

    return meetings;
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }
}
