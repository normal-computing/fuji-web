import React, { useState } from "react";
import {
  Button,
  Text,
  VStack,
  Heading,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  Textarea,
  useDisclosure,
  useToast,
  HStack,
  IconButton,
  Spacer,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useAppState } from "../state/store";
import NewKnowledgeForm from "./NewKnowledgeForm";
import { type EditingData } from "../helpers/knowledge";

type HostKnowledgeProps = {
  host: string;
  onEdit: (host: string) => void;
};

const HostKnowledge = ({ host, onEdit }: HostKnowledgeProps) => {
  const customKnowledgeBase = useAppState(
    (state) => state.settings.customKnowledgeBase,
  );
  const updateSettings = useAppState((state) => state.settings.actions.update);

  const getJson = (): string => {
    return JSON.stringify(customKnowledgeBase[host], null, 2);
  };

  const handleRemove = () => {
    const newKnowledge = { ...customKnowledgeBase };
    delete newKnowledge[host];
    updateSettings({ customKnowledgeBase: newKnowledge });
  };

  return (
    <>
      <HStack>
        <Heading as="h4" size="md">
          {host}
        </Heading>
        <Spacer />
        <IconButton
          aria-label="Remove knowledge"
          icon={<DeleteIcon />}
          size="sm"
          variant="ghost"
          onClick={handleRemove}
        />
      </HStack>
      <Accordion allowToggle>
        {customKnowledgeBase[host].rules?.map((rule, ruleIndex) => (
          <AccordionItem key={ruleIndex} backgroundColor="white">
            <Heading as="h4" size="xs">
              <AccordionButton>
                <Box>Rule {ruleIndex + 1}</Box>
                <AccordionIcon />
              </AccordionButton>
            </Heading>
            <AccordionPanel>
              <pre style={{ overflowX: "auto" }}>{getJson()}</pre>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <Button mt={3} size="sm" onClick={() => onEdit(host)}>
        Edit
      </Button>
    </>
  );
};

const CustomKnowledgeBase = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [jsonInput, setJsonInput] = useState("");
  const [editKnowledge, setEditKnowledge] = useState<EditingData | undefined>(
    undefined,
  );
  const customKnowledgeBase = useAppState(
    (state) => state.settings.customKnowledgeBase,
  );
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const toast = useToast();

  const openForm = () => setIsFormOpen(true);

  const closeForm = () => {
    setEditKnowledge(undefined);
    setIsFormOpen(false);
  };

  const openEditForm = (host: string) => {
    const originalRules = customKnowledgeBase[host].rules;

    const transformedRules = originalRules?.map((rule) => ({
      ...rule,
      regexType: "custom",
    }));

    if (transformedRules) {
      setEditKnowledge({
        host,
        rules: transformedRules,
      });
    }

    openForm();
  };

  const validateJSON = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      Object.keys(parsedJson).forEach((host) => {
        const hostData = parsedJson[host];
        // Basic validation for the structure
        if (!hostData.rules || !Array.isArray(hostData.rules)) {
          throw new Error(`Invalid structure for host: ${host}`);
        }
        // Further validation can be added here, e.g., checking if regex is valid, checking each rule's structure
      });

      const newKnowledge = { ...customKnowledgeBase, ...parsedJson };
      updateSettings({ customKnowledgeBase: newKnowledge });
      setJsonInput("");
      onClose();
    } catch (error) {
      console.error("Failed to save JSON", error);
      toast({
        title: "Error",
        description: `"Failed to save JSON: ${error}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={4}>
      {Object.keys(customKnowledgeBase).length > 0 ? (
        Object.keys(customKnowledgeBase).map((host) => (
          <Box key={host} w="full" p={4} borderWidth="1px" borderRadius="lg">
            <HostKnowledge host={host} onEdit={openEditForm} />
          </Box>
        ))
      ) : (
        <Text>No knowledge found. Please add your first knowledge.</Text>
      )}
      <Button onClick={openForm}>Add Host Knowledge</Button>
      <Button onClick={onOpen}>Add Freeform Host Knowledge</Button>
      {/* New knowledge form modal */}
      <Modal isOpen={isFormOpen} onClose={closeForm}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <NewKnowledgeForm
            isEditMode={!!editKnowledge}
            editKnowledge={editKnowledge}
            onSaved={closeForm}
          />
        </ModalContent>
      </Modal>
      {/* JSON input modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>New Host Knowledge</ModalHeader>
          <ModalBody>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Enter knowledge in the correct JSON format"
              height="auto"
              rows={20}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={validateJSON}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default CustomKnowledgeBase;
