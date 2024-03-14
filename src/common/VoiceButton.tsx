import React, { useState, useEffect } from "react";
import { Button, HStack, Icon } from "@chakra-ui/react";
import { BsPlayFill, BsStopFill } from "react-icons/bs";
import { voiceControl } from "../helpers/voiceControl";

export default function VoiceButton(props: {
  audioMode: boolean;
  taskInProgress: boolean;
}) {
  const [isListening, setIsListening] = useState(false);

  const toggleVoiceControl = () => {
    if (props.audioMode) {
      if (!isListening) {
        voiceControl.startListening();
      } else {
        voiceControl.stopListening();
        document.dispatchEvent(new CustomEvent("stopListening"));
      }
      setIsListening(!isListening);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only toggle voice control if audioMode is true
      if (event.code === "Space" && props.audioMode) {
        event.preventDefault();
        toggleVoiceControl();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isListening, props.audioMode]);

  const button = (
    <Button
      rightIcon={
        <Icon as={isListening ? BsStopFill : BsPlayFill} boxSize={6} />
      }
      onClick={toggleVoiceControl}
      colorScheme={isListening ? "red" : "blue"}
      isDisabled={!props.audioMode || props.taskInProgress}
    >
      {isListening ? "Stop" : "Start"} Speaking
    </Button>
  );

  return <HStack alignItems="center">{button}</HStack>;
}
