import { useState } from "react";
import {
  Alert,
  AlertIcon,
  AlertDescription,
  VStack,
  HStack,
  Box,
  Accordion,
  AccordionItem,
  Heading,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Spacer,
  ColorProps,
  BackgroundProps,
  Text,
  Button,
} from "@chakra-ui/react";
import { TaskHistoryEntry } from "../state/currentTask";
import { BsSortNumericDown, BsSortNumericUp } from "react-icons/bs";
import { useAppState } from "../state/store";
import CopyButton from "./CopyButton";
import Notes from "./CustomKnowledgeBase/Notes";

function MatchedNotes() {
  const knowledge = useAppState((state) => state.currentTask.knowledgeInUse);
  const notes = knowledge?.notes;
  if (!notes || notes.length === 0) {
    return null;
  }

  return (
    <AccordionItem>
      <Heading as="h3" size="sm">
        <AccordionButton>
          <Box mr="4" fontWeight="bold">
            0.
          </Box>
          <Box as="span" textAlign="left" flex="1">
            Found {notes.length} instructions.
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Heading>
      <AccordionPanel backgroundColor="gray.100" p="2">
        <Accordion allowMultiple w="full" defaultIndex={1}>
          <Box pl={2}>
            <Notes notes={notes} />
          </Box>
          <Alert status="info" borderRadius="sm" mt="1">
            <AlertIcon />
            <AlertDescription fontSize="0.8rem" lineHeight="4">
              You can customize instructions in the settings menu.
            </AlertDescription>
          </Alert>
        </Accordion>
      </AccordionPanel>
    </AccordionItem>
  );
}

type TaskHistoryItemProps = {
  index: number;
  entry: TaskHistoryEntry;
};

const CollapsibleComponent = (props: {
  title: string;
  subtitle?: string;
  text: string;
}) => (
  <AccordionItem backgroundColor="white">
    <Heading as="h4" size="xs">
      <AccordionButton>
        <HStack flex="1">
          <Box>{props.title}</Box>
          <CopyButton text={props.text} /> <Spacer />
          {props.subtitle && (
            <Box as="span" fontSize="xs" color="gray.500" mr={4}>
              {props.subtitle}
            </Box>
          )}
        </HStack>
        <AccordionIcon />
      </AccordionButton>
    </Heading>
    <AccordionPanel>
      {props.text.split("\n").map((line, index) => (
        <Box key={index} fontSize="xs">
          {line}
          <br />
        </Box>
      ))}
    </AccordionPanel>
  </AccordionItem>
);

const TaskHistoryItem = ({ index, entry }: TaskHistoryItemProps) => {
  const itemTitle = entry.action.thought;

  const colors: {
    text: ColorProps["textColor"];
    bg: BackgroundProps["bgColor"];
  } = {
    text: undefined,
    bg: undefined,
  };
  if (entry.action.operation.name === "fail") {
    colors.text = "red.800";
    colors.bg = "red.100";
  } else if (entry.action.operation.name === "finish") {
    colors.text = "green.800";
    colors.bg = "green.100";
  }

  return (
    <AccordionItem>
      <Heading as="h3" size="sm" textColor={colors.text} bgColor={colors.bg}>
        <AccordionButton>
          <Box mr="4" fontWeight="bold">
            {index + 1}.
          </Box>
          <Box as="span" textAlign="left" flex="1">
            {itemTitle}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Heading>
      <AccordionPanel backgroundColor="gray.100" p="2">
        <Accordion allowMultiple w="full" defaultIndex={1}>
          {entry.usage != null && (
            <>
              <CollapsibleComponent
                title="Prompt"
                subtitle={`${entry.usage.prompt_tokens} tokens`}
                text={entry.prompt}
              />
              <CollapsibleComponent
                title="Response"
                subtitle={`${entry.usage.completion_tokens} tokens`}
                text={entry.response}
              />
              <CollapsibleComponent
                title="Action"
                text={JSON.stringify(entry.action, null, 2)}
              />
            </>
          )}
        </Accordion>
      </AccordionPanel>
    </AccordionItem>
  );
};

const PendingApprovalItem = () => {
  const { isPendingApproval, proposedAction, setUserDecision } = useAppState(
    (state) => state.hitl,
  );

  if (!isPendingApproval || !proposedAction) return null;

  return (
    <Box
      border="2px solid"
      borderColor="yellow.400"
      p="4"
      backgroundColor="yellow.50"
    >
      <VStack align="stretch" spacing={4}>
        <HStack>
          <Box mr="4" fontWeight="bold">
            ⚠️
          </Box>
          <Text fontWeight="medium">Action requires approval</Text>
        </HStack>
        <Text fontSize="sm">{proposedAction.thought}</Text>
        <HStack justify="end" spacing={2}>
          <Button
            size="sm"
            colorScheme="red"
            onClick={() => setUserDecision("reject")}
          >
            Reject
          </Button>
          <Button
            size="sm"
            colorScheme="green"
            onClick={() => setUserDecision("approve")}
          >
            Approve
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default function TaskHistory() {
  const { taskHistory, taskStatus } = useAppState((state) => ({
    taskStatus: state.currentTask.status,
    taskHistory: state.currentTask.history,
  }));
  const [sortNumericDown, setSortNumericDown] = useState(false);
  const toggleSort = () => {
    setSortNumericDown(!sortNumericDown);
  };

  if (taskHistory.length === 0 && taskStatus !== "running") return null;

  // Sort task history based on the sort state
  const sortedHistory = [...taskHistory].sort((a, b) => {
    // Assuming each entry has a unique identifier or timestamp for sorting
    // Replace 'timestamp' with the appropriate property if different
    const aTime = a.usage?.prompt_tokens || 0;
    const bTime = b.usage?.prompt_tokens || 0;

    if (sortNumericDown) {
      return aTime - bTime; // Ascending
    } else {
      return bTime - aTime; // Descending
    }
  });

  const historyItems = sortedHistory.map((entry, index) => (
    <TaskHistoryItem key={index} index={index} entry={entry} />
  ));

  return (
    <VStack mt={8} align="stretch">
      <HStack w="full">
        <Heading as="h3" size="md">
          Action History
        </Heading>
        <Spacer />
        <Icon
          as={sortNumericDown ? BsSortNumericDown : BsSortNumericUp}
          cursor="pointer"
          color="gray.500"
          _hover={{ color: "gray.700" }}
          onClick={toggleSort}
        />
        <CopyButton text={JSON.stringify(taskHistory, null, 2)} />
      </HStack>
      <Accordion allowMultiple w="full" pb="4">
        {/* Always render fixed items first */}
        <PendingApprovalItem />
        <MatchedNotes />
        {/* Then render sorted history items */}
        {historyItems}
      </Accordion>
    </VStack>
  );
}
