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
import { type EditingHostData } from "../helpers/knowledge";

type HostKnowledgeProps = {
  host: string;
  onEdit: (host: string) => void;
};

const HostKnowledge = ({ host, onEdit }: HostKnowledgeProps) => {
  const hostData = useAppState((state) => state.settings.hostData);
  const updateSettings = useAppState((state) => state.settings.actions.update);

  const getJson = (): string => {
    return JSON.stringify(hostData[host], null, 2);
  };

  const handleRemove = () => {
    const newHostData = { ...hostData };
    delete newHostData[host];
    updateSettings({ hostData: newHostData });
  };

  return (
    <>
      <Heading as="h4" size="md">
        {host}
      </Heading>
      <Accordion allowToggle>
        {hostData[host].rules?.map((rule, ruleIndex) => (
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
  const [editingHostData, setEditingHostData] = useState<
    EditingHostData | undefined
  >(undefined);
  const hostData = useAppState((state) => state.settings.hostData);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHostData(undefined);
  };

  const openEditForm = (host: string) => {
    const originalRules = hostData[host].rules;

    const transformedRules = originalRules?.map((rule) => ({
      ...rule,
      regexType: "custom",
    }));

    if (transformedRules) {
      setEditingHostData({
        host,
        rules: transformedRules,
      });
    }

    openModal();
  };

  return (
    <VStack spacing={4}>
      {Object.keys(hostData).length > 0 ? (
        Object.keys(hostData).map((host) => (
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
            isEditMode={!!editingHostData}
            editData={editingHostData}
            onSaved={closeModal}
          />
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default CustomKnowledgeBase;
