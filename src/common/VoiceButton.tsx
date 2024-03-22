import { useEffect, useCallback } from "react";
import { Button, HStack, Icon } from "@chakra-ui/react";
import { BsPlayFill, BsStopFill } from "react-icons/bs";
import { useAppState } from "../state/store";

export default function VoiceButton({
  taskInProgress,
  onStopSpeaking,
}: {
  taskInProgress: boolean;
  onStopSpeaking: () => void;
}) {
  const state = useAppState((state) => ({
    isListening: state.currentTask.isListening,
    startListening: state.currentTask.actions.startListening,
    stopListening: state.currentTask.actions.stopListening,
  }));

  const toggleVoiceControl = useCallback(() => {
    if (!taskInProgress) {
      if (!state.isListening) {
        state.startListening();
      } else {
        state.stopListening();
        onStopSpeaking();
      }
    }
  }, [state, taskInProgress, onStopSpeaking]);

  useEffect(() => {
    if (!taskInProgress) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === "Space") {
          event.preventDefault();
          toggleVoiceControl();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [taskInProgress, toggleVoiceControl]);

  const button = (
    <Button
      rightIcon={
        <Icon as={state.isListening ? BsStopFill : BsPlayFill} boxSize={6} />
      }
      onClick={toggleVoiceControl}
      colorScheme={state.isListening ? "red" : "blue"}
      isDisabled={taskInProgress}
    >
      {state.isListening ? "Stop" : "Start"} Speaking
    </Button>
  );

  return <HStack alignItems="center">{button}</HStack>;
}
