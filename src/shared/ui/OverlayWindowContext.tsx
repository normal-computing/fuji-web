import { createContext } from "react";

export type Status = "minimized" | "normal";
export type OverlayWindowContextType = {
  status: Status;
  setStatus: (status: Status) => void;
} | null;

export const OverlayWindowContext =
  createContext<OverlayWindowContextType>(null);
