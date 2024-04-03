import {
  Button,
  Input,
  VStack,
  Text,
  Link,
  HStack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import React from "react";
import { useAppState } from "../state/store";

type SetAPIKeyProps = {
  asInitializerView?: boolean;
  initialOpenAIKey?: string;
  initialAnthropicKey?: string;
  onClose?: () => void;
};

const SetAPIKey = ({
  asInitializerView = false,
  initialOpenAIKey = "",
  initialAnthropicKey = "",
  onClose,
}: SetAPIKeyProps) => {
  const { updateSettings } = useAppState((state) => ({
    updateSettings: state.settings.actions.update,
  }));

  const [openAIKey, setOpenAIKey] = React.useState(initialOpenAIKey || "");
  const [anthropicKey, setAnthropicKey] = React.useState(
    initialAnthropicKey || "",
  );
  const [showPassword, setShowPassword] = React.useState(false);

  const onSave = () => {
    updateSettings({
      openAIKey,
      anthropicKey,
    });
    onClose && onClose();
  };

  return (
    <VStack spacing={4}>
      <Text fontSize="sm">
        You&rsquo;ll need an OpenAI or Anthropic API Key to run the WebWand in
        developer mode. If you don&rsquo;t already have one available, you can
        create one in your{" "}
        <Link
          href="https://platform.openai.com/account/api-keys"
          color="blue"
          isExternal
        >
          OpenAI account
        </Link>{" "}
        or your{" "}
        <Link
          href="https://console.anthropic.com/settings/keys"
          color="blue"
          isExternal
        >
          Anthropic account
        </Link>
        .
        <br />
        <br />
        WebWand stores your API keys locally on your device, and they are only
        used to communicate with the OpenAI API and/or the Anthropic API.
      </Text>
      <FormControl>
        <FormLabel>OpenAI API Key</FormLabel>
        <HStack w="full">
          <Input
            placeholder="Enter OpenAI API Key"
            value={openAIKey}
            onChange={(event) => setOpenAIKey(event.target.value)}
            type={showPassword ? "text" : "password"}
          />
          {asInitializerView && (
            <Button
              onClick={() => setShowPassword(!showPassword)}
              variant="outline"
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          )}
        </HStack>
      </FormControl>
      <FormControl>
        <FormLabel>Anthropic API Key</FormLabel>
        <HStack w="full">
          <Input
            placeholder="Enter Anthropic API Key"
            value={anthropicKey}
            onChange={(event) => setAnthropicKey(event.target.value)}
            type={showPassword ? "text" : "password"}
          />
          {asInitializerView && (
            <Button
              onClick={() => setShowPassword(!showPassword)}
              variant="outline"
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          )}
        </HStack>
      </FormControl>
      <Button
        onClick={onSave}
        w="full"
        isDisabled={!openAIKey && !anthropicKey}
        colorScheme="blue"
      >
        Save Key
      </Button>
    </VStack>
  );
};

export default SetAPIKey;
