"use client";

import MatchSelector from "./MatchSelector";
import MatchResultTable from "./details/MatchResult";
import MatchDetailsTable from "./details/MatchDetailsTable";
import PlayerOfTheMatch from "@/app/features/players/components/PlayerOfTheMatch";
import MatchOpinions from "./MatchOpinions";
import { useState } from "react";
import { useMatchWithStats } from "@/app/contexts/MatchWithStatsContext";

export default function Matches() {
  const [showOnlyMatchPercentage, setShowOnlyMatchPercentage] = useState(true);

  const {
    playersWithStatsUntilMatchNumber,
    match,
    currentTeamPercentages,
    untilMatchTeamPercentages,
    playersWithStats,
    isLoading,
    error,
  } = useMatchWithStats();

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
              playersWithStats={playersWithStats}
              playersWithStatsUntilMatchNumber={
                playersWithStatsUntilMatchNumber
              }
              currentTeamPercentages={currentTeamPercentages}
              untilMatchTeamPercentages={untilMatchTeamPercentages}
              showOnlyMatchPercentage={showOnlyMatchPercentage}
              onShowOnlyMatchPercentageChange={setShowOnlyMatchPercentage}
            />

            <MatchResultTable match={match} />

            <PlayerOfTheMatch match={match} />
            <MatchOpinions match={match} />
          </>
        )}
      </div>
    </div>
  );
}
