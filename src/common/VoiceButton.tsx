import { useEffect } from "react";
import { Button, HStack, Icon } from "@chakra-ui/react";
import { BsPlayFill, BsStopFill } from "react-icons/bs";
import { useAppState } from "../state/store";

export default function VoiceButton(props: {
  taskInProgress: boolean;
  onStopSpeaking: () => void;
}) {
  const state = useAppState((state) => ({
    isListening: state.currentTask.isListening,
    startListening: state.currentTask.actions.startListening,
    stopListening: state.currentTask.actions.stopListening,
  }));

  const toggleVoiceControl = () => {
    if (!props.taskInProgress) {
      if (!state.isListening) {
        state.startListening();
      } else {
        state.stopListening();
        props.onStopSpeaking();
      }
    }
  };

  useEffect(() => {
    if (!props.taskInProgress) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === "Space") {
          event.preventDefault();
          toggleVoiceControl();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [state.isListening, props.taskInProgress]);

  const button = (
    <Button
      rightIcon={
        <Icon as={state.isListening ? BsStopFill : BsPlayFill} boxSize={6} />
      }
      onClick={toggleVoiceControl}
      colorScheme={state.isListening ? "red" : "blue"}
      isDisabled={props.taskInProgress}
    >
      {state.isListening ? "Stop" : "Start"} Speaking
    </Button>
  );

  return <HStack alignItems="center">{button}</HStack>;
}
