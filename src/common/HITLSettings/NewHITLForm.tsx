import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
} from "@chakra-ui/react";

type NewHITLFormProps = {
  isOpen: boolean;
  isEditMode: boolean;
  editRule?: {
    id: string;
    pattern: string;
    description: string;
  };
  closeForm: () => void;
};

const NewHITLForm: React.FC<NewHITLFormProps> = ({
  isOpen,
  isEditMode,
  // editRule, // Unused for now
  closeForm,
}) => {
  // TODO: Implement form logic
  return (
    <Modal isOpen={isOpen} onClose={closeForm} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditMode ? "Edit Safety Checkpoint" : "Add Safety Checkpoint"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} pb={4}>
            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Input placeholder="e.g., Confirm before posting to Twitter" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Pattern</FormLabel>
              <Textarea placeholder="e.g., Before clicking 'Post' button" />
            </FormControl>
            <Button colorScheme="blue" w="full">
              {isEditMode ? "Update" : "Add"} Checkpoint
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NewHITLForm;
