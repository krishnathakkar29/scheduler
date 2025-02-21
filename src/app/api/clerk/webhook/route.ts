import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { data } = await req.json();

    console.log(data.id);

    const name = `${data.first_name} ${data.last_name}`;
    const username = name.split(" ").join("-") + data.id.slice(-4);

    const user = await prisma.user.upsert({
      where: {
        clerkUserId: data.id,
      },
      update: {
        clerkUserId: data.id,
        name,
        email: data.email_addresses[0].email_address,
        imageUrl: data.imageUrl,
        username,
      },
      create: {
        clerkUserId: data.id,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email_addresses[0].email_address,
        imageUrl: data.imageUrl,
        username,
      },
    });

    console.log("user", user);

    return new Response("Webhook Received", { status: 200 });
  } catch (error) {
    console.log("Error\n", error);
    return new Response("Error webhook", { status: 400 });
  }
}
