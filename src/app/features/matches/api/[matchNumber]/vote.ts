import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/app/features/auth/utils/users";
import { UserProfileWithPlayerId } from "@/app/constants/types";
import { getCollection } from "@/app/utils/server/db";

type MatchParams = {
  matchNumber: string;
};

export async function createVoteHandler(
  request: NextRequest,
  { params }: { params: MatchParams }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { matchNumber, playerVotedFor } = await getMatchParams(
      params,
      request
    );

    await removeVoteFromPlayer(user.playerId, matchNumber);
    await addVoteToPlayer(user, matchNumber, playerVotedFor);

    return NextResponse.json({ message: "Vote registered successfully" });
  } catch (error) {
    console.error("Error registering vote:", error);
    return NextResponse.json(
      { error: "Error registering vote" },
      { status: 500 }
    );
  }
}

async function getMatchParams(params: MatchParams, request: NextRequest) {
  const matchNumber = parseInt(params.matchNumber);
  const { playerVotedFor } = await request.json();

  if (!playerVotedFor) {
    throw new Error("Player vote is required");
  }

  return { matchNumber, playerVotedFor };
}

async function removeVoteFromPlayer(playerId: string, matchNumber: number) {
  const matchesCollection = await getCollection("matches");

  try {
    // Add or update the vote
    await matchesCollection.updateOne(
      { matchNumber, deletedAt: { $exists: false } },
      {
        $pull: {
          playerOfTheMatchVotes: { userId: playerId },
        },
      }
    );
  } catch (error) {
    console.error("Error removing vote from player:", error);
    throw error;
  }
}

async function addVoteToPlayer(
  { playerId, displayName }: UserProfileWithPlayerId,
  matchNumber: number,
  playerVotedFor: string
) {
  const matchesCollection = await getCollection("matches");

  try {
    const updatedMatch = await matchesCollection.updateOne(
      { matchNumber, deletedAt: { $exists: false } },
      {
        $push: {
          playerOfTheMatchVotes: {
            userId: playerId,
            playerVotedFor: playerVotedFor,
            userName: displayName,
          },
        },
      }
    );

    if (!updatedMatch) {
      throw new Error("Match not found");
    }
  } catch (error) {
    console.error("Error adding vote to player:", error);
    throw error;
  }
}
