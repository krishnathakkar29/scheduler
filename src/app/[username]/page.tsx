import React from "react";
import { getUserByUsername } from "../../../actions/userAction";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import EventCard from "@/components/event-card";

export const generateMetadata = async ({
  params,
}: {
  params: {
    username: string;
  };
}) => {
  const username = await params.username;
  const user = await getUserByUsername(username);
  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${user.name}'s Profile | Your App Name`,
    description: `Book an event with ${user.name}. View available public events and schedules.`,
  };
};

export default async function UserProfilePage({
  params,
}: {
  params: {
    username: string;
  };
}) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={user.imageUrl!} alt={user?.name!} />
          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
        <p className="text-gray-600 text-center">
          Welcome to my scheduling page. Please select an event below to book a
          call with me.
        </p>
      </div>

      {user.events.length == 0 ? (
        <>
          {" "}
          <p className="text-center text-gray-600">
            No public events available.
          </p>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.events.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                username={params.username}
                isPublic
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
