import React, { Suspense } from "react";
import { getEvent } from "../../../../actions/eventAction";
import EventCard from "@/components/event-card";

type Props = {};

export const dynamic = "force-dynamic";

export default function EventsPage() {
  return (
    <Suspense fallback={<div>Loading events...</div>}>
      <Events />
    </Suspense>
  );
}

async function Events() {
  const { event, username } = await getEvent();

  if (event.length === 0) {
    return <p>You haven&apos;t created any events yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {event.map((item, index) => (
        <EventCard key={index} event={item} username={username} />
      ))}
    </div>
  );
}
