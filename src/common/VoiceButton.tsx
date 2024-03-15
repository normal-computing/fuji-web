import React, { useState, useEffect } from "react";
import { Button, HStack, Icon } from "@chakra-ui/react";
import { BsPlayFill, BsStopFill } from "react-icons/bs";
import { voiceControl } from "../helpers/voiceControl";

export default function VoiceButton(props: {
  taskInProgress: boolean;
  onStopSpeaking: () => void;
}) {
  const [isListening, setIsListening] = useState(false);

  const toggleVoiceControl = () => {
    if (!props.taskInProgress) {
      if (!isListening) {
        voiceControl.startListening();
      } else {
        voiceControl.stopListening();
        props.onStopSpeaking();
      }
      setIsListening(!isListening);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        toggleVoiceControl();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isListening, props.taskInProgress]);

  const button = (
    <Button
      rightIcon={
        <Icon as={isListening ? BsStopFill : BsPlayFill} boxSize={6} />
      }
      onClick={toggleVoiceControl}
      colorScheme={isListening ? "red" : "blue"}
      isDisabled={props.taskInProgress}
    >
      {isListening ? "Stop" : "Start"} Speaking
    </Button>
  );

  return <HStack alignItems="center">{button}</HStack>;
}
