import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";
import UpdateLinkForm from "@/components/update-link-form";
import prisma from "@/lib/db";

type Props = {};

const page = async (props: Props) => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const dbUser = await prisma.user.findFirst({
    where: {
      clerkUserId: user.id,
    },
  });


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.firstName}!</CardTitle>
        </CardHeader>
        <CardContent>Loading content....</CardContent>
      </Card>

      <UpdateLinkForm username={dbUser?.username} />
    </div>
  );
};

export default page;
