import React, { createContext, useContext, useState, useCallback } from "react";
import { Recording } from "@/types";

interface ImmersivePlayerContextType {
  isOpen: boolean;
  recording: Recording | null;
  openImmersive: (recording: Recording) => void;
  closeImmersive: () => void;
}

const ImmersivePlayerContext = createContext<ImmersivePlayerContextType>({
  isOpen: false,
  recording: null,
  openImmersive: () => {},
  closeImmersive: () => {},
});

export const useImmersivePlayer = () => useContext(ImmersivePlayerContext);

export const ImmersivePlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recording, setRecording] = useState<Recording | null>(null);

  const openImmersive = useCallback((rec: Recording) => {
    setRecording(rec);
    setIsOpen(true);
  }, []);

  const closeImmersive = useCallback(() => {
    setIsOpen(false);
    // Keep recording reference briefly for exit animation
    setTimeout(() => setRecording(null), 400);
  }, []);

  return (
    <ImmersivePlayerContext.Provider value={{ isOpen, recording, openImmersive, closeImmersive }}>
      {children}
    </ImmersivePlayerContext.Provider>
  );
};
