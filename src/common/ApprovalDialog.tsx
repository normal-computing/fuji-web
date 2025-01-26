import { useAppState } from "../state/store";

const ApprovalDialog = () => {
  const { isPendingApproval, setUserDecision } = useAppState(
    (state) => state.hitl,
  );

  if (!isPendingApproval) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        <h2 className="text-lg font-bold mb-4">Approval Required</h2>
        <p className="mb-4">Pending Approval Box Placeholder</p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={() => setUserDecision("reject")}
          >
            Reject
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => setUserDecision("approve")}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDialog;
