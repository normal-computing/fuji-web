import { Button, VStack, Text } from "@chakra-ui/react";
import { useAppState } from "../state/store";

const tasks = [
  'Post on twitter.com with content "an automated post from WebWand by @NormalComputing! :)" If I\'m not logged in, fail the task and wait for me to log in.',
  "Find a book about AI and add a physical copy to cart on Amazon.com. Pick the cheaper one from paperback and hardcover.",
];

const RecommendedTasks = ({
  runTask,
}: {
  runTask: (instructions: string) => void;
}) => {
  const state = useAppState((state) => ({
    instructions: state.ui.instructions,
  }));
  if (state.instructions) {
    return null;
  }

  const onButtonClick = (idx: number) => {
    runTask(tasks[idx]);
  };

  return (
    <VStack spacing={2} align="stretch">
      <Text fontSize="large" mt={1}>
        Examples:
      </Text>
      <Button
        textAlign="left"
        display="block"
        variant="outline"
        height="4rem"
        onClick={() => onButtonClick(0)}
      >
        <Text fontWeight={600} noOfLines={1}>
          Post on twitter.com
        </Text>
        <Text fontWeight={400} noOfLines={1} color="gray">
          with content &quot;an automated post from WebWand by
          @NormalComputing!&quot;
        </Text>
      </Button>
      <Button
        textAlign="left"
        display="block"
        variant="outline"
        height="4rem"
        onClick={() => onButtonClick(1)}
      >
        <Text fontWeight={600} noOfLines={1}>
          Find a book about AI
        </Text>
        <Text fontWeight={400} noOfLines={1} color="gray">
          and add a physical copy to cart on Amazon.com
        </Text>
      </Button>
    </VStack>
  );
};

export default RecommendedTasks;
