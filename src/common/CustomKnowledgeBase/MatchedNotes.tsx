import { useAppState } from "../../state/store";
import {
  Alert,
  AlertIcon,
  AlertDescription,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import Notes from "./Notes";

export default function MatchedNotes() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const knowledge = useAppState((state) => state.currentTask.knowledgeInUse);
  const notes = knowledge?.notes;
  if (!notes || notes.length === 0) {
    return null;
  }

  return (
    <>
      <Button variant="link" onClick={onOpen}>
        Found {notes.length} instructions.
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            WebWand uses the following instructions and tips:
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Notes notes={notes} />
            <Alert status="info" borderRadius="md" my="1rem">
              <AlertIcon />
              <AlertDescription fontSize="1rem">
                You can customize instructions in the settings menu.
              </AlertDescription>
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
