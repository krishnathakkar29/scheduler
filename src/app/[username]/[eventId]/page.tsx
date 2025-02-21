import EventDetails from "@/components/EventBooking/event-details";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BookingForm from "@/components/EventBooking/booking-form";
import { getEventDetails } from "../../../../actions/eventAction";
import { getEventAvailability } from "../../../../actions/availabilityAction";

export async function generateMetadata({ params }: { params: any }) {
  const param = await params;
  const { event } = await getEventDetails(param.username, param.eventId);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `Book ${event.title} with ${event.user.name} | Your App Name`,
    description: `Schedule a ${event.duration}-minute ${event.title} event with ${event.user.name}.`,
  };
}

export default async function EventBookingPage({
  params,
}: {
  params: {
    username: string;
    eventId: string;
  };
}) {
  const param = await params;
  const { event } = await getEventDetails(param.username, param.eventId);
  const availability = await getEventAvailability(param.eventId);
  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col md:flex-row justify-center px-4 py-8">
      <EventDetails event={event} />
      <Suspense fallback={<div>Loading booking form...</div>}>
        <BookingForm event={event} availability={availability} />
      </Suspense>
    </div>
  );
}
