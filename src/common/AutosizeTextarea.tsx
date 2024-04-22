import { Textarea, TextareaProps } from "@chakra-ui/react";
import ResizeTextarea from "react-textarea-autosize";
import React from "react";

const AutosizeTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    return (
      <Textarea
        minH="unset"
        overflow="hidden"
        w="100%"
        resize="none"
        ref={ref}
        minRows={4}
        as={ResizeTextarea}
        {...props}
      />
    );
  },
);

AutosizeTextarea.displayName = "AutosizeTextarea";

export default AutosizeTextarea;
