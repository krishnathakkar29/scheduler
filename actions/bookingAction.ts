"use server";
import prisma from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";

export async function createBooking(bookingData: any) {
  try {
    const clerkClientRes = await clerkClient();
    const event = await prisma.event.findUnique({
      where: {
        id: bookingData.eventId,
      },
      include: {
        user: true,
      },
    });

    if (!event) {
      throw new Error("Event not found ");
    }

    const { data } = await clerkClientRes.users.getUserOauthAccessToken(
      event.user.clerkUserId,
      "oauth_google"
    );

    const token = data[0]?.token;

    if (!token) {
      throw new Error("Event creator has not connected Google Calendar");
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const meetResponse = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: `${bookingData.name} - ${event.title}`,
        description: bookingData.additionalInfo,
        start: { dateTime: bookingData.startTime },
        end: { dateTime: bookingData.endTime },
        attendees: [{ email: bookingData.email }, { email: event.user.email }],
        conferenceData: {
          createRequest: { requestId: `${event.id}-${Date.now()}` },
        },
      },
    });

    const meetLink = meetResponse.data.hangoutLink;
    const googleEventId = meetResponse.data.id;

    const booking = await prisma.booking.create({
      data: {
        email: bookingData.email,
        name: bookingData.name,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        additionalInfo: bookingData.additionalInfo,
        userId: event.user.id,
        eventId: event.id,
        meetLink: meetLink as string,
        googleEventId: googleEventId as string,
      },
    });

    return { success: true, booking, meetLink };
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }
}
