import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useAppState } from "@root/src/state/store";
import { useState } from "react";
import DuplicateKnowledgeAlert from "./DuplicateKnowledgeAlert";
import { type Data } from "@root/src/helpers/knowledge";

type NewKnowledgeJsonProps = {
  isOpen: boolean;
  onClose: () => void;
};

const NewKnowledgeJson = ({ isOpen, onClose }: NewKnowledgeJsonProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [newCustomKnowledge, setNewCustomKnowledge] = useState<Data | null>(
    null,
  );
  const [duplicatedHosts, setduplicatedHosts] = useState<Data | null>(null);
  const toast = useToast();
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const customKnowledgeBase = useAppState(
    (state) => state.settings.customKnowledgeBase,
  );

  function saveKnowledges() {
    const newKnowledge = { ...customKnowledgeBase, ...newCustomKnowledge };
    updateSettings({ customKnowledgeBase: newKnowledge });
  }

  const validateJSON = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const dupHosts: Data = {};
      const hostsKnowledges: Data = {};
      Object.keys(parsedJson).forEach((host: string) => {
        const hostKnowledge = parsedJson[host];
        // Basic validation for the structure
        if (!hostKnowledge.rules || !Array.isArray(hostKnowledge.rules)) {
          throw new Error(`Invalid structure for host: ${host}`);
        }
        // Further validation can be added here, e.g., checking if regex is valid, checking each rule's structure

        const hostName = host.startsWith("www.") ? host.slice(4) : host;
        hostsKnowledges[hostName] = hostKnowledge;
        if (hostName in customKnowledgeBase) {
          dupHosts[hostName] = hostKnowledge;
        }
      });
      setNewCustomKnowledge(hostsKnowledges);
      if (Object.keys(dupHosts).length > 0) {
        setduplicatedHosts(dupHosts);
        setShowDuplicateAlert(true);
      } else {
        saveKnowledges();
        setJsonInput("");
        onClose();
      }
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

  const duplicatedHostsNames = (): string => {
    let names = "";
    if (duplicatedHosts) {
      Object.keys(duplicatedHosts).forEach((host) => {
        names = names + host;
      });
    }
    return names;
  };

  function handleAlertOnSave(): void {
    saveKnowledges();
    setduplicatedHosts(null);
    setShowDuplicateAlert(false);
    setJsonInput("");
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <DuplicateKnowledgeAlert
          host={duplicatedHostsNames()}
          isOpen={showDuplicateAlert}
          onSave={handleAlertOnSave}
          onClose={() => setShowDuplicateAlert(false)}
        />
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
  );
};

export default NewKnowledgeJson;
