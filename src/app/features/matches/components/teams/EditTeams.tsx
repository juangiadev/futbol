"use client";

import { useEffect, useState } from "react";
import { SerializedMatch } from "@/app/constants/types/Match";
import {
  MatchDetailsTable,
  MatchResultTable,
  MatchSelector,
} from "@/app/features/matches/components";
import {
  PlayerWithStats,
  SerializedPlayer,
} from "@/app/constants/types/Player";

export default function EditTeams({
  maxMatchNumber,
  players,
  playersMap,
  playersWithStats,
}: {
  maxMatchNumber: number;
  players: SerializedPlayer[];
  playersMap: { [key: string]: SerializedPlayer };
  playersWithStats: PlayerWithStats[];
}) {
  const [match, setMatch] = useState<SerializedMatch | null>(null);
  const [teamPercentages, setTeamPercentages] = useState({
    oscuras: 0,
    claras: 0,
  });
  const [isRemoving, setIsRemoving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchMatch = async (number: string) => {
    setIsLoading(true);
    setError("");
    setMatch(null);
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/matches/${number}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al buscar el partido");
      }

      if (data.match) {
        setMatch(data.match);
      } else {
        setError("Partido no encontrado");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al buscar el partido"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (maxMatchNumber) {
      fetchMatch(maxMatchNumber.toString());
    }
  }, [maxMatchNumber]);

  useEffect(() => {
    if (match && playersWithStats) {
      const teamPercentages = getSumOfPercentageColumnByTeam(
        playersWithStats,
        match
      );
      setTeamPercentages(teamPercentages);
    }
  }, [match, playersWithStats]);

  const updatePlayerGoals = (
    team: "oscuras" | "claras",
    index: number,
    goals: number
  ) => {
    if (!match) return;

    setMatch((prevMatch) => {
      if (prevMatch == null) return null;

      return {
        ...prevMatch,
        [team]: {
          ...prevMatch[team],
          players: prevMatch[team].players.map((player, i) =>
            i === index ? { ...player, goals } : player
          ),
        },
      };
    });
  };

  const updatePlayer = (
    team: "oscuras" | "claras",
    index: number,
    playerId: string
  ) => {
    if (!match) return;

    const newPlayer = players.find((player) => player._id === playerId);

    const updatedMatch = {
      ...match,
      [team]: {
        team,
        players: match[team].players.map((player, i) =>
          i === index && !!newPlayer
            ? { _id: newPlayer._id, goals: player.goals }
            : player
        ),
      },
    };

    const teamPercentages = getSumOfPercentageColumnByTeam(
      playersWithStats,
      updatedMatch
    );

    setTeamPercentages(teamPercentages);
    setMatch(updatedMatch);
  };

  const removeGame = async () => {
    if (!match) return;

    setIsRemoving(true);
    setError("");

    const hasGoals =
      match.oscuras.players.some((p) => p.goals > 0) ||
      match.claras.players.some((p) => p.goals > 0);

    if (hasGoals) {
      const confirmed = window.confirm(
        "Vas a borrar un partido *jugado*, estas seguro?"
      );
      if (!confirmed) {
        setIsRemoving(false);
        return;
      }
    }

    const response = await fetch(`/api/matches/${match.matchNumber}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el partido");
    }

    setSuccessMessage("Partido eliminado exitosamente");
    setIsRemoving(false);
  };

  const saveChanges = async () => {
    if (!match) return;

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/matches/${match.matchNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oscuras: { team: "oscuras", players: match.oscuras.players },
          claras: { team: "claras", players: match.claras.players },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar los cambios");
      }

      setSuccessMessage("Cambios guardados exitosamente");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al guardar los cambios"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isPlayerAvailable = (
    playerId: string,
    team: "oscuras" | "claras",
    currentIndex: number
  ) => {
    if (!match) return false;

    const isInOscuras = match.oscuras.players.some(
      (p, i) =>
        p._id === playerId && i !== (team === "oscuras" ? currentIndex : -1)
    );
    const isInClaras = match.claras.players.some(
      (p, i) =>
        p._id === playerId && i !== (team === "claras" ? currentIndex : -1)
    );

    return !isInOscuras && !isInClaras;
  };

  return (
    <div className="min-h-screen bg-[#0B2818] py-8">
      <div className="max-w-7xl mx-auto px-4 ">
        <div className="bg-[#77777736] rounded-lg shadow-lg p-6">
          <MatchSelector
            onMatchSelect={fetchMatch}
            isLoading={isLoading}
            maxMatchNumber={maxMatchNumber}
          />

          {error && (
            <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg mb-6">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-center p-4 bg-green-100 text-green-700 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {match && (
            <>
              <MatchDetailsTable
                match={match}
                players={players}
                playersMap={playersMap}
                playersWithStats={playersWithStats}
                onUpdatePlayerGoals={updatePlayerGoals}
                isPlayerAvailable={isPlayerAvailable}
                onUpdatePlayer={updatePlayer}
                isEditable
                teamPercentages={teamPercentages}
              />

              <MatchResultTable match={match} />

              <div className="flex justify-center mb-6">
                <button
                  onClick={saveChanges}
                  disabled={isSaving}
                  className={`
                      px-6 py-3 
                      bg-[#1a472a] hover:bg-[#143620]
                      text-white font-semibold rounded-lg
                      shadow-md flex items-center space-x-2
                      border border-green-700
                      ${
                        !isSaving
                          ? "transform hover:scale-105 transition-all duration-200 hover:shadow-lg"
                          : "opacity-50 cursor-not-allowed"
                      }
                    `}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={removeGame}
                  disabled={isRemoving}
                  className="text-red-500 px-6 py-3 
                      bg-[#1a472a] hover:bg-[#143620]
                      font-semibold rounded-lg
                      shadow-md flex items-center space-x-2
                      border border-green-700"
                >
                  {isRemoving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                        />
                      </svg>
                      <span>Eliminar Partido</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getSumOfPercentageColumnByTeam(
  playersWithStats: PlayerWithStats[],
  match: SerializedMatch
) {
  console.log("playersWithStats", playersWithStats);

  const oscurasPercentage = match.oscuras.players.reduce((acc, player) => {
    const playerStats = playersWithStats.find((p) => p._id === player._id);
    return acc + (playerStats?.percentage || 0);
  }, 0);

  const clarasPercentage = match.claras.players.reduce((acc, player) => {
    const playerStats = playersWithStats.find((p) => p._id === player._id);
    return acc + (playerStats?.percentage || 0);
  }, 0);

  return { oscuras: oscurasPercentage, claras: clarasPercentage };
}
