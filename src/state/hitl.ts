import { MyStateCreator } from "./store";
import { Action } from "../helpers/vision-agent/parseResponse";

export type HitlSlice = {
  proposedAction: Action | null;
  setProposedAction: (action: Action | null) => void;
  userDecision: "approve" | "reject" | null;
  setUserDecision: (decision: "approve" | "reject" | null) => void;
  isPendingApproval: boolean;
  setIsPendingApproval: (isPending: boolean) => void;
  waitForApproval: () => Promise<"approve" | "reject">;
};

export const createHitlSlice: MyStateCreator<HitlSlice> = (set, get) => ({
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
  isPendingApproval: false,
  setIsPendingApproval: (isPending) =>
    set((state) => {
      state.hitl.isPendingApproval = isPending;
    }),
  waitForApproval: async () => {
    return new Promise((resolve) => {
      const checkDecision = () => {
        const decision = get().hitl.userDecision;
        if (decision) {
          resolve(decision);
        } else {
          setTimeout(checkDecision, 100);
        }
      };
      checkDecision();
    });
  },
});
