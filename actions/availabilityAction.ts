"use server";
import { AvailabilityData } from "@/components/availability-form";
import prisma from "@/lib/db";
import { availabilitySchema } from "@/lib/schema";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

export async function getUserAvailability() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      include: {
        Availabity: {
          include: {
            days: true,
          },
        },
      },
    });

    if (!user || !user.Availabity) {
      return null;
    }

    const availabilityData: any = {
      timeGap: user.Availabity.timeGap,
    };

    [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ].forEach((day) => {
      const dayAvailability = user.Availabity?.days.find(
        (d) => d.day === day.toUpperCase()
      );

      availabilityData[day] = {
        isAvailable: !!dayAvailability,
        startTime: dayAvailability
          ? dayAvailability.startTime.toISOString().slice(11, 16)
          : "09:00",
        endTime: dayAvailability
          ? dayAvailability.endTime.toISOString().slice(11, 16)
          : "17:00",
      };
    });

    return availabilityData as AvailabilityData;
  } catch (error: any) {
    console.log("Error updating username", error);
    throw new Error("Failed to update username", error.message);
  }
}

export async function updateUserAvailability(data: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { Availabity: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const availabilityData = Object.entries(data).flatMap(
      ([day, { isAvailable, startTime, endTime }]: any) => {
        if (isAvailable) {
          const timing = new Date().toISOString().split("T")[0];

          return [
            {
              day: day.toUpperCase(),
              startTime: new Date(`${timing}T${startTime}:00Z`),
              endTime: new Date(`${timing}T${endTime}:00Z`),
            },
          ];
        }
        return [];
      }
    );


    if (user.Availabity) {
      await prisma.availability.update({
        where: { id: user.Availabity.id },
        data: {
          timeGap: data.timeGap,
          days: {
            deleteMany: {},
            create: availabilityData,
          },
        },
      });
    } else {
      await prisma.availability.create({
        data: {
          userId: user.id,
          timeGap: data.timeGap,
          days: {
            create: availabilityData,
          },
        },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.log("Error updating availability", error);
    throw new Error("Failed to update availability", error.message);
  }
}
