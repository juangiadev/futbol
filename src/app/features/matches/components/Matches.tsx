"use client";

import MatchSelector from "./MatchSelector";
import MatchResultTable from "./details/MatchResult";
import MatchDetailsTable from "./details/MatchDetailsTable";
import PlayerOfTheMatch from "@/app/features/players/components/PlayerOfTheMatch";
import MatchOpinions from "./MatchOpinions";
import { PlayersResponse } from "@/app/features/players/utils/server";
import { UserProfileWithPlayerId } from "@/app/constants/types";
import { useState } from "react";
import { useTournament } from "@/app/contexts/TournamentContext";
import { useMatchWithStats } from "@/app/contexts/MatchWithStatsContext";

export default function Matches({
  user,
  players: { playersMap, players },
}: {
  user: UserProfileWithPlayerId | null;
  players: PlayersResponse;
}) {
  const [showOnlyMatchPercentage, setShowOnlyMatchPercentage] = useState(false);

  const {
    fetchMatch,
    playersWithStatsUntilMatchNumber,
    match,
    currentTeamPercentages,
    untilMatchTeamPercentages,
    isLoading,
    error,
  } = useMatchWithStats();

  const { selectedTournamentData } = useTournament();

  const onVoteSubmitted = () => {
    fetchMatch();
  };

  return (
    <div className="min-h-screen bg-[#0B2818] p-4">
      <div className="max-w-7xl mx-auto bg-[#77777736] rounded-lg shadow-lg p-6">
        <MatchSelector isLoading={isLoading} />

        {error && (
          <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        )}

        {match && (
          <>
            <MatchDetailsTable
              match={match}
              playersWithStatsUntilMatchNumber={
                playersWithStatsUntilMatchNumber
              }
              currentTeamPercentages={currentTeamPercentages}
              untilMatchTeamPercentages={untilMatchTeamPercentages}
              playersMap={playersMap}
              players={players}
              showOnlyMatchPercentage={showOnlyMatchPercentage}
              onShowOnlyMatchPercentageChange={setShowOnlyMatchPercentage}
            />

            <MatchResultTable match={match} />

            {selectedTournamentData && match.matchNumber >= 5 && (
              <>
                <PlayerOfTheMatch
                  match={match}
                  playersMap={playersMap}
                  isLatestMatch={
                    match.matchNumber === selectedTournamentData.maxMatchNumber
                  }
                  onVoteSubmitted={onVoteSubmitted}
                  user={user}
                />
                <MatchOpinions
                  match={match}
                  isLatestMatch={
                    match.matchNumber === selectedTournamentData.maxMatchNumber
                  }
                  hasUserPlayedMatch={[match.oscuras, match.claras].some(
                    (team) =>
                      team.players.some(
                        (player) =>
                          player._id.toString() === user?.playerId.toString()
                      )
                  )}
                  // TODO: Add onOpinionSubmitted
                  onOpinionSubmitted={onVoteSubmitted}
                  user={user}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
