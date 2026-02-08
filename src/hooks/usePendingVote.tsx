import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface PendingVote {
  tapaId: string;
  tapaName: string;
  venueId: string;
  venueName: string;
  stars: number;
}

interface PendingVoteContextType {
  pendingVote: PendingVote | null;
  setPendingVote: (vote: PendingVote | null) => void;
  clearPendingVote: () => void;
}

const PendingVoteContext = createContext<PendingVoteContextType | undefined>(undefined);

const STORAGE_KEY = "tapea_pending_vote";

export const PendingVoteProvider = ({ children }: { children: ReactNode }) => {
  const [pendingVote, setPendingVoteState] = useState<PendingVote | null>(() => {
    // Recover from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const setPendingVote = (vote: PendingVote | null) => {
    setPendingVoteState(vote);
    if (vote) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vote));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearPendingVote = () => {
    setPendingVoteState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <PendingVoteContext.Provider value={{ pendingVote, setPendingVote, clearPendingVote }}>
      {children}
    </PendingVoteContext.Provider>
  );
};

export const usePendingVote = () => {
  const context = useContext(PendingVoteContext);
  if (context === undefined) {
    throw new Error("usePendingVote must be used within a PendingVoteProvider");
  }
  return context;
};
