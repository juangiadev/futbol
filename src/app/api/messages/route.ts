import { NextRequest, NextResponse } from "next/server";
import pusher from "@/lib/pusher";
import { getAuthenticatedUser } from "@/app/features/auth/utils/users";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { getCollection } from "@/app/utils/server/db";
import { ObjectId } from "mongodb";
import { getMessages } from "@/app/utils/server/messages";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const messages = await getMessages();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Error fetching messages" },
      { status: 500 }
    );
  }
};

export const POST = withApiAuthRequired(async function POST(
  request: NextRequest
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const messagesCollection = await getCollection("messages");

    const message = {
      _id: new ObjectId(),
      userId: user.playerId,
      userName: user.displayName,
      content: content.trim(),
      teamLogo: user.favoriteTeam,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
    };

    await messagesCollection.insertOne(message);

    // Trigger a Pusher event on the "messages-channel" with the event "new-message"
    await pusher.trigger("messages-channel", "new-message", message);

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Error sending message" },
      { status: 500 }
    );
  }
});
