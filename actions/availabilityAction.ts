"use server";
import { AvailabilityData } from "@/components/availability-form";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  addDays,
  addMinutes,
  format,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";

interface GenerateTimeSlots {
  startTime: Date;
  endTime: Date;
  eventDuration: number;
  timeGap: number;
  dateStr: any;
  bookings: any;
}

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

export async function getEventAvailability(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      user: {
        include: {
          Availabity: {
            select: {
              days: true,
              timeGap: true,
            },
          },
          bookings: {
            select: {
              startTime: true,
              endTime: true,
            },
          },
        },
      },
    },
  });

  if (!event || !event.user.Availabity) {
    return [];
  }

  const { Availabity, bookings } = event.user;
  const startDate = startOfDay(new Date());
  const endDate = addDays(startDate, 30); // Get availability for the next 30 days

  const availableDates = [];

  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const dayOfWeek = format(date, "EEEE").toUpperCase();
    const dayAvailability = Availabity?.days?.find(
      (d) => d.day === dayOfWeek
    );

    if (dayAvailability) {
      const dateStr = format(date, "yyyy-MM-dd");

      const slots = generateAvailableTimeSlots(
        dayAvailability.startTime,
        dayAvailability.endTime,
        event.duration,
        bookings,
        dateStr,
        Availabity.timeGap
      );

      availableDates.push({
        date: dateStr,
        slots,
      });
    }
  }

  return availableDates;
}

function generateAvailableTimeSlots(
  startTime: any,
  endTime: any,
  duration: any,
  bookings: any,
  dateStr: any,
  timeGap: any = 0
) {
  const slots = [];
  let currentTime = parseISO(
    `${dateStr}T${startTime.toISOString().slice(11, 16)}`
  );
  const slotEndTime = parseISO(
    `${dateStr}T${endTime.toISOString().slice(11, 16)}`
  );


  const now = new Date();
  if (format(now, "yyyy-MM-dd") === dateStr) {
    currentTime = isBefore(currentTime, now)
      ? addMinutes(now, timeGap)
      : currentTime;
  }

  while (currentTime < slotEndTime) {
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);

    const isSlotAvailable = !bookings.some((booking: any) => {
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;
      return (
        (currentTime >= bookingStart && currentTime < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (currentTime <= bookingStart && slotEnd >= bookingEnd)
      );
    });

    if (isSlotAvailable) {
      slots.push(format(currentTime, "HH:mm"));
    }

    currentTime = slotEnd;
  }

  return slots;
}
