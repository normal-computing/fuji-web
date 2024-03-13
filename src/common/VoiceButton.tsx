import React, { useState, useEffect } from "react";
import { Button, HStack, Icon } from "@chakra-ui/react";
import { BsPlayFill, BsStopFill } from "react-icons/bs";
import { voiceControl } from "../helpers/voiceControl";

export default function VoiceButton() {
  const [isListening, setIsListening] = useState(false);

  const toggleVoiceControl = () => {
    if (!isListening) {
      voiceControl.startListening();
    } else {
      voiceControl.stopListening();
    }
    setIsListening(!isListening);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        toggleVoiceControl();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isListening]);

  const button = (
    <Button
      rightIcon={
        <Icon as={isListening ? BsStopFill : BsPlayFill} boxSize={6} />
      }
      onClick={toggleVoiceControl}
      colorScheme={isListening ? "red" : "blue"}
    >
      {isListening ? "Stop" : "Start"} Speaking
    </Button>
  );

  return <HStack alignItems="center">{button}</HStack>;
}
