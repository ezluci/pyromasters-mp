export type MatchMetadata =
  | {
      ownerId: number;
      map: string | null;
      playersByColors: {
        color: string;
        playerId: number;
      }[];
      winnerId: number | null;
    }
  | { winnerId: number | null };
