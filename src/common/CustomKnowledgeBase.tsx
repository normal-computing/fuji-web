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
  ModalCloseButton,
} from "@chakra-ui/react";
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
      <Heading as="h4" size="md">
        {host}
      </Heading>
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
      <Button colorScheme="red" onClick={handleRemove}>
        Remove
      </Button>
      <Button colorScheme="blue" onClick={() => onEdit(host)}>
        Edit
      </Button>
    </>
  );
};

const CustomKnowledgeBase = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editKnowledge, setEditKnowledge] = useState<EditingData | undefined>(
    undefined,
  );
  const customKnowledgeBase = useAppState(
    (state) => state.settings.customKnowledgeBase,
  );

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditKnowledge(undefined);
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

    openModal();
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
      <Button onClick={openModal}>Add Host Knowledge</Button>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <NewKnowledgeForm
            isEditMode={!!editKnowledge}
            editKnowledge={editKnowledge}
            onSaved={closeModal}
          />
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default CustomKnowledgeBase;
