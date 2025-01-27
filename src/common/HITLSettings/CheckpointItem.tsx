import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Text, Flex, IconButton, Tooltip } from "@chakra-ui/react";
import type { CheckpointRule } from "../../helpers/hitl";

type CheckpointItemProps = {
  rule: CheckpointRule;
  onEdit: (rule: CheckpointRule) => void;
  onDelete: (id: string) => void;
};

const CheckpointItem = ({ rule, onEdit, onDelete }: CheckpointItemProps) => {
  return (
    <Box w="full" p={4} borderWidth="1px" borderRadius="lg">
      <Flex alignItems="flex-start">
        <Box flex="1">
          <Text fontWeight="bold">{rule.description}</Text>
        </Box>
        <Box>
          <Tooltip label="Edit checkpoint">
            <IconButton
              aria-label="Edit checkpoint"
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              onClick={() => onEdit(rule)}
            />
          </Tooltip>
          <Tooltip label="Remove checkpoint">
            <IconButton
              aria-label="Remove checkpoint"
              icon={<DeleteIcon />}
              size="sm"
              variant="ghost"
              onClick={() => onDelete(rule.id)}
            />
          </Tooltip>
        </Box>
      </Flex>
    </Box>
  );
};

export default CheckpointItem;
