"use server";
import prisma from "@/lib/db";
import { eventSchema } from "@/lib/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

export async function createEvent({
  description,
  duration,
  isPrivate,
  title,
}: z.infer<typeof eventSchema>) {
  try {
    const { userId } = await auth();
    const client = await clerkClient();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    const event = await prisma.event.create({
      data: {
        title,
        duration,
        isPrivate,
        description,
        userId: existingUser.id,
      },
    });

    return {
      success: true,
      event,
    };
  } catch (error: any) {
    console.log("Error updating username", error);
    throw new Error("Failed to update username", error.message);
  }
}

export async function getEvent() {
  try {
    const { userId } = await auth();
    const client = await clerkClient();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    const allEvents = await prisma.event.findMany({
      where: {
        userId: existingUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    return {
      success: true,
      event: allEvents,
      username: existingUser.username,
    };
  } catch (error: any) {
    console.log("Error updating username", error);
    throw new Error("Failed to update username", error.message);
  }
}

export async function deleteEvent(eventId: string) {
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

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.userId !== user.id) {
      throw new Error("Event not found or unauthorized");
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return { success: true };
  } catch (error: any) {
    console.log("Error updating username", error);
    throw new Error("Failed to update username", error.message);
  }
}
