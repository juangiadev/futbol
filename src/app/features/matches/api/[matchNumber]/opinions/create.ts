import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/app/features/auth/utils/users";
import { ObjectId } from "mongodb";
import {
  getMatchNumberQuery,
  getMatchParams,
} from "@/app/features/matches/utils/server";
import { getOpinionParams } from "../../../utils/server/opinions";
import { getCollection } from "@/app/utils/server/db";

export async function createOpinionHandler(
  request: NextRequest,
  { params }: { params: { matchNumber: string } }
) {
  const user = await getAuthenticatedUser(true);
  const { matchNumber, tournamentId } = getMatchParams(request, params);
  const { content } = await getOpinionParams(request);

  const matchesCollection = await getCollection("matches");

  await matchesCollection.updateOne(
    {
      ...getMatchNumberQuery(matchNumber, tournamentId),
    },
    {
      $push: {
        opinions: {
          _id: new ObjectId(),
          userId: user.playerId,
          userName: user.displayName,
          content: content.trim(),
          createdAt: new Date(),
        },
      },
    }
  );

  return NextResponse.json({ message: "Opinion registered successfully" });
}
