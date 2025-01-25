import React, { useState } from "react";
import { Button, Text, VStack, Box, Alert, AlertIcon } from "@chakra-ui/react";
// import { useAppState } from "../../state/store"; // Unused for now
import NewHITLForm from "./NewHITLForm";

// TODO: Move to types file when implementing
type HITLRule = {
  id: string;
  pattern: string;
  description: string;
};

const HITLSettings = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editRule, setEditRule] = useState<HITLRule | undefined>(undefined);

  // TODO: Implement in store
  const hitlRules: HITLRule[] = [];

  const closeForm = () => {
    setEditRule(undefined);
    setIsFormOpen(false);
  };

  // const openEditForm = (rule: HITLRule) => { // Unused for now
  //   setEditRule(rule);
  //   setIsFormOpen(true);
  // }

  return (
    <VStack spacing={4}>
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Text>
          Add checkpoints to make Fuji ask for your permission before performing
          certain actions.
        </Text>
      </Alert>
      {hitlRules.length > 0 ? (
        hitlRules.map((rule) => (
          <Box key={rule.id} w="full" p={4} borderWidth="1px" borderRadius="lg">
            <Text fontWeight="bold">{rule.description}</Text>
            <Text fontSize="sm" color="gray.600">
              Pattern: {rule.pattern}
            </Text>
          </Box>
        ))
      ) : (
        <Text>No safety checkpoints configured</Text>
      )}
      <Button onClick={() => setIsFormOpen(true)}>Add Safety Checkpoint</Button>
      {isFormOpen && (
        <NewHITLForm
          isOpen={isFormOpen}
          isEditMode={!!editRule}
          editRule={editRule}
          closeForm={closeForm}
        />
      )}
    </VStack>
  );
};

export default HITLSettings;
