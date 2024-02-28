export { DomActions } from "./rpc/domActions";
export { callRPC, callRPCWithTab } from "./rpc/pageRPC";
export { attachDebugger, detachDebugger } from "./chromeDebugger";
import performAction from "./rpc/performAction";
export { performAction };
export type { Action } from "./rpc/performAction";
