import React, { useCallback, useState } from "react";
import {
  Button,
  Box,
  HStack,
  Spacer,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { debugMode } from "../constants";
import { useAppState } from "../state/store";
import RunTaskButton from "./RunTaskButton";
import VoiceButton from "./VoiceButton";
import TaskHistory from "./TaskHistory";
import TaskStatus from "./TaskStatus";
import RecommendedTasks from "./RecommendedTasks";

function ActionExecutor() {
  const state = useAppState((state) => ({
    attachDebugger: state.currentTask.actions.attachDebugger,
    detachDegugger: state.currentTask.actions.detachDebugger,
    performActionString: state.currentTask.actions.performActionString,
    prepareLabels: state.currentTask.actions.prepareLabels,
    showImagePrompt: state.currentTask.actions.showImagePrompt,
  }));
  const [action, setAction] = useState<string>(`{
  "thought": "try searching",
  "action": "click('search')"
}
`);
  return (
    <Box mt={4}>
      <Textarea
        value={action}
        onChange={(e) => setAction(e.target.value)}
        mb={2}
      />
      <HStack>
        <Button onClick={state.attachDebugger}>Attach</Button>
        <Button onClick={state.prepareLabels}>Prepare</Button>
        <Button onClick={state.showImagePrompt}>Show Image</Button>
        <Button
          onClick={() => {
            state.performActionString(action);
          }}
        >
          Run
        </Button>
      </HStack>
    </Box>
  );
}

const TaskUI = () => {
  const state = useAppState((state) => ({
    taskHistory: state.currentTask.history,
    taskStatus: state.currentTask.status,
    runTask: state.currentTask.actions.runTask,
    instructions: state.ui.instructions,
    setInstructions: state.ui.actions.setInstructions,
    voiceMode: state.settings.voiceMode,
  }));
  const taskInProgress = state.taskStatus === "running";

  const toast = useToast();

  const toastError = useCallback(
    (message: string) => {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
    [toast],
  );

  const runTask = useCallback(
    (newInstructions: string = "") => {
      if (newInstructions) {
        state.setInstructions(newInstructions);
      }
      const instructions = newInstructions || state.instructions;
      instructions && state.runTask(toastError);
    },
    [state, toastError],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      runTask();
    }
  };

  return (
    <>
      <Textarea
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        placeholder="Try telling WebWand to do something..."
        value={state.instructions || ""}
        disabled={taskInProgress || state.voiceMode}
        onChange={(e) => state.setInstructions(e.target.value)}
        mb={2}
        onKeyDown={onKeyDown}
      />
      <HStack mt={2} mb={2}>
        <RunTaskButton runTask={runTask} />
        {state.voiceMode && (
          <VoiceButton
            taskInProgress={taskInProgress}
            onStopSpeaking={runTask}
          />
        )}
        <Spacer />
        {debugMode && <TaskStatus />}
      </HStack>
      {state.voiceMode && (
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            In Voice Mode, you can press Space to start speaking and Space again
            to stop. WebWand will run the task when you stop speaking.
          </AlertDescription>
        </Alert>
      )}
      {!state.voiceMode && !state.instructions && (
        <RecommendedTasks runTask={runTask} />
      )}
      {debugMode && <ActionExecutor />}
      <TaskHistory />
    </>
  );
};

export default TaskUI;
