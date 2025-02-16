import {
  MatchTeam,
  PlayerWithStats,
  SerializedMatch,
  SerializedPlayer,
} from "@/app/constants/types";
import TeamColumn from "@/app/features/matches/components/TeamColumn";
import { getMostVotedPlayersOfTheMatch } from "@/app/features/players/utils";

type MatchDetailsTableProps = {
  match: SerializedMatch;
  playersMap: { [key: string]: SerializedPlayer };
  playersWithStats?: PlayerWithStats[];
  isEditable?: boolean;
  onUpdatePlayerGoals?: (team: MatchTeam, index: number, goals: number) => void;
  onUpdatePlayer?: (team: MatchTeam, index: number, playerId: string) => void;
  players?: SerializedPlayer[];
  isPlayerAvailable?: (
    playerId: string,
    team: MatchTeam,
    currentIndex: number
  ) => boolean;
  teamPercentages?: { oscuras: number; claras: number };
};

export default function MatchDetailsTable({
  match,
  playersMap,
  playersWithStats,
  isEditable = false,
  onUpdatePlayerGoals,
  onUpdatePlayer,
  players = [],
  isPlayerAvailable,
  teamPercentages,
}: MatchDetailsTableProps) {
  const mostVotedPlayersIds = getMostVotedPlayersOfTheMatch(match);

  return (
    <div className="overflow-x-auto mt-6 mb-6">
      <table className="min-w-full bg-[#1a472a]">
        <thead>
          <tr>
            <th className="px-4 py-2 text-white font-bold uppercase tracking-wider text-sm w-1/6 text-center border-r border-green-700">
              Goles
            </th>
            <th className="px-4 py-2 text-white font-bold uppercase tracking-wider text-sm w-1/6 text-center bg-gray-600 border-r border-green-700">
              Oscuras
            </th>
            {playersWithStats && teamPercentages && (
              <th className="px-4 py-2 text-white font-bold uppercase tracking-wider text-sm w-1/6 text-center border-r border-green-700">
                {teamPercentages.oscuras
                  ? (teamPercentages.oscuras / 8).toFixed(1)
                  : "-"}
                %
              </th>
            )}
            <th className="px-4 py-2 text-gray-600 font-bold uppercase tracking-wider text-sm w-1/6 text-center bg-white border-r border-green-700">
              Claras
            </th>

            {playersWithStats && teamPercentages && (
              <th className="px-4 py-2 text-white font-bold uppercase tracking-wider text-sm w-1/6 text-center border-r border-green-700">
                {teamPercentages.claras
                  ? (teamPercentages.claras / 8).toFixed(1)
                  : "-"}
                %
              </th>
            )}
            <th className="px-4 py-2 text-white font-bold uppercase tracking-wider text-sm w-1/6 text-center">
              Goles
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({
            length: Math.max(
              match.oscuras.players.length,
              match.claras.players.length
            ),
          }).map((_, index) => (
            <tr key={index} className="border-t border-green-700">
              <TeamColumn
                team="oscuras"
                index={index}
                match={match}
                playersMap={playersMap}
                isEditable={isEditable}
                onUpdatePlayerGoals={onUpdatePlayerGoals}
                onUpdatePlayer={onUpdatePlayer}
                players={players}
                playersWithStats={playersWithStats}
                isPlayerAvailable={isPlayerAvailable}
                mostVotedPlayersIds={mostVotedPlayersIds}
              />
              <TeamColumn
                team="claras"
                index={index}
                match={match}
                playersMap={playersMap}
                isEditable={isEditable}
                onUpdatePlayerGoals={onUpdatePlayerGoals}
                onUpdatePlayer={onUpdatePlayer}
                players={players}
                playersWithStats={playersWithStats}
                isPlayerAvailable={isPlayerAvailable}
                mostVotedPlayersIds={mostVotedPlayersIds}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
