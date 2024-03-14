import React, { useCallback, useState } from "react";
import {
  Button,
  HStack,
  Spacer,
  Textarea,
  useToast,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { debugMode } from "../constants";
import { useAppState } from "../state/store";
import RunTaskButton from "./RunTaskButton";
import VoiceButton from "./VoiceButton";
import TaskHistory from "./TaskHistory";
import TaskStatus from "./TaskStatus";

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
    <div>
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
    </div>
  );
}

const TaskUI = () => {
  const state = useAppState((state) => ({
    taskHistory: state.currentTask.history,
    taskStatus: state.currentTask.status,
    runTask: state.currentTask.actions.runTask,
    instructions: state.ui.instructions,
    setInstructions: state.ui.actions.setInstructions,
  }));
  const [audioMode, setAudioMode] = useState(false);

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

  const runTask = () => {
    state.instructions && state.runTask(toastError);
    // if (state.instructions) {
    //   chrome.runtime.sendMessage({
    //     action: 'runTask',
    //     task: state.instructions,
    //   });
    // }
  };

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
        disabled={taskInProgress || audioMode}
        onChange={(e) => state.setInstructions(e.target.value)}
        mb={2}
        onKeyDown={onKeyDown}
      />
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="audio-mode" mb="0">
          Audio Mode
        </FormLabel>
        <Switch
          id="audio-mode"
          isChecked={audioMode}
          onChange={(e) => setAudioMode(e.target.checked)}
        />
      </FormControl>
      <HStack>
        <RunTaskButton runTask={runTask} />
        <VoiceButton audioMode={audioMode} taskInProgress={taskInProgress} />
        <Spacer />
        {debugMode && <TaskStatus />}
      </HStack>
      {debugMode && <ActionExecutor />}
      <TaskHistory />
    </>
  );
};

export default TaskUI;
