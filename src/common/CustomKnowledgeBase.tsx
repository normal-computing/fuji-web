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
  IconButton,
  Tooltip,
  Flex,
} from "@chakra-ui/react";
import { DeleteIcon, CopyIcon, EditIcon } from "@chakra-ui/icons";
import { useAppState } from "../state/store";
import NewKnowledgeForm from "./NewKnowledgeForm";
import {
  fetchAllDefaultKnowledge,
  type EditingData,
} from "../helpers/knowledge";

type HostKnowledgeProps = {
  host: string;
  isDefaultKnowledge: boolean;
  onEdit?: (host: string) => void;
};

const HostKnowledge = ({
  host,
  isDefaultKnowledge,
  onEdit,
}: HostKnowledgeProps) => {
  const toast = useToast();
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const customKnowledgeBase = useAppState(
    (state) => state.settings.customKnowledgeBase,
  );
  const knowledgeBase = isDefaultKnowledge
    ? fetchAllDefaultKnowledge()
    : customKnowledgeBase;

  const getJsonString = (): string => {
    return JSON.stringify(knowledgeBase[host], null, 2);
  };

  const handleRemove = () => {
    const newKnowledge = { ...knowledgeBase };
    delete newKnowledge[host];
    updateSettings({ customKnowledgeBase: newKnowledge });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getJsonString());
      toast({
        title: "Copied",
        description: "Knowledge has been copied to clipboard.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy knowledge to clipboard.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Flex alignItems="flex-start">
        <Heading as="h5" size="sm" flex="1" overflowWrap="anywhere">
          {!isDefaultKnowledge && (
            <Box position="relative" style={{ float: "right" }}>
              <Tooltip label="Edit knowledge">
                <IconButton
                  aria-label="Edit knowledge"
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (onEdit) onEdit(host);
                  }}
                />
              </Tooltip>
              <Tooltip label="Copy knowledge">
                <IconButton
                  aria-label="Copy knowledge"
                  icon={<CopyIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                />
              </Tooltip>
              <Tooltip label="Remove knowledge">
                <IconButton
                  aria-label="Remove knowledge"
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={handleRemove}
                />
              </Tooltip>
            </Box>
          )}
          {host}
        </Heading>
      </Flex>
      <Accordion allowToggle>
        {knowledgeBase[host].rules?.map((rule, ruleIndex) => (
          <AccordionItem key={ruleIndex} backgroundColor="white">
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Rule {ruleIndex + 1}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <pre style={{ overflowX: "auto" }}>{getJsonString()}</pre>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
};

const DefaultKnowledge = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const defaultKnowledgeBase = fetchAllDefaultKnowledge();

  return (
    <>
      <Button size="sm" variant="link" colorScheme="blue" onClick={onOpen}>
        View Default Knowledge
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Default Knowledge Base</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {Object.keys(defaultKnowledgeBase).map((host) => (
              <Box
                key={host}
                w="full"
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                mb={3}
              >
                <HostKnowledge host={host} isDefaultKnowledge={true} />
              </Box>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const CustomKnowledgeBase = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [editKnowledge, setEditKnowledge] = useState<EditingData | undefined>(
    undefined,
  );
  const customKnowledgeBase = useAppState(
    (state) => state.settings.customKnowledgeBase,
  );
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      <DefaultKnowledge />
      {Object.keys(customKnowledgeBase).length > 0 ? (
        Object.keys(customKnowledgeBase).map((host) => (
          <Box key={host} w="full" p={4} borderWidth="1px" borderRadius="lg">
            <HostKnowledge
              host={host}
              isDefaultKnowledge={false}
              onEdit={openEditForm}
            />
          </Box>
        ))
      ) : (
        <Text>No custom knowledge found</Text>
      )}
      <Button onClick={openForm}>Add Host Knowledge with Form</Button>
      <Button onClick={onOpen}>Add Host Knowledge with JSON</Button>
      {/* New knowledge form modal */}
      <Modal isOpen={isFormOpen} onClose={closeForm}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <NewKnowledgeForm
            isEditMode={!!editKnowledge}
            editKnowledge={editKnowledge}
            closeForm={closeForm}
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
              placeholder="Enter knowledge in JSON format"
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
