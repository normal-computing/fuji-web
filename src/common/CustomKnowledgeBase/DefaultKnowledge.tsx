import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { fetchAllDefaultKnowledge } from "@root/src/helpers/knowledge";
import HostKnowledge from "./HostKnowledge";

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

export default DefaultKnowledge;
