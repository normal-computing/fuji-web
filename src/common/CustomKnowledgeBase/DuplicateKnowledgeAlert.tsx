import React, { useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";

type DuplicateKnowledgeAlertProps = {
  host: string;
  isOpen: boolean;
  onSave: () => void;
  onClose: () => void;
};

const DuplicateKnowledgeAlert = ({
  host,
  isOpen,
  onSave,
  onClose,
}: DuplicateKnowledgeAlertProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Save Knowledge
          </AlertDialogHeader>

          <AlertDialogBody fontSize="md">
            {host} already exists in the knowledge base. Saving will overwrite
            it. Do you want to proceed?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button size="sm" colorScheme="blue" onClick={onSave} mr={3}>
              Save
            </Button>
            <Button size="sm" ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DuplicateKnowledgeAlert;
