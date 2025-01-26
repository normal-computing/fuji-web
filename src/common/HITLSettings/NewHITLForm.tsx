import React, { useState } from "react";
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
  onSave: (rule: { pattern: string; description: string }) => void;
};

const NewHITLForm: React.FC<NewHITLFormProps> = ({
  isOpen,
  isEditMode,
  editRule,
  closeForm,
  onSave,
}) => {
  const [pattern, setPattern] = useState(editRule?.pattern || "");
  const [description, setDescription] = useState(editRule?.description || "");

  const handleSubmit = () => {
    if (!pattern || !description) return;
    onSave({ pattern, description });
    setPattern("");
    setDescription("");
  };

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
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Confirm before posting to Facebook"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Pattern</FormLabel>
              <Textarea
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g., Confirm before clicking 'Post' button on facebook.com"
              />
            </FormControl>
            <Button colorScheme="blue" w="full" onClick={handleSubmit}>
              {isEditMode ? "Update" : "Add"} Checkpoint
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NewHITLForm;
