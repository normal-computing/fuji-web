import { MyStateCreator } from "./store";
import { Action } from "../helpers/vision-agent/parseResponse";

export type HitlSlice = {
  proposedAction: Action | null;
  setProposedAction: (action: Action | null) => void;
  userDecision: "approve" | "reject" | null;
  setUserDecision: (decision: "approve" | "reject" | null) => void;
};

export const createHitlSlice: MyStateCreator<HitlSlice> = (set) => ({
  proposedAction: null,
  setProposedAction: (action) =>
    set((state) => {
      state.hitl.proposedAction = action;
    }),
  userDecision: null,
  setUserDecision: (decision) =>
    set((state) => {
      state.hitl.userDecision = decision;
    }),
});
