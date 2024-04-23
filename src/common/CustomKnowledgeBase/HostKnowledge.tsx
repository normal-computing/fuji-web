import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  Tooltip,
  Flex,
  Box,
} from "@chakra-ui/react";
import { fetchAllDefaultKnowledge } from "../../helpers/knowledge";
import { useAppState } from "@root/src/state/store";
import Notes from "./Notes";

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
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const customKnowledgeBase = useAppState(
    (state) => state.settings.customKnowledgeBase,
  );
  const knowledgeBase = isDefaultKnowledge
    ? fetchAllDefaultKnowledge()
    : customKnowledgeBase;

  if (knowledgeBase[host] === undefined) {
    return null;
  }
  const rules = knowledgeBase[host].rules;
  if (rules === undefined) {
    return null;
  }

  const handleRemove = () => {
    const newKnowledge = { ...knowledgeBase };
    delete newKnowledge[host];
    updateSettings({ customKnowledgeBase: newKnowledge });
  };

  // temporarily disable copy feature
  /*
  const getJsonString = (): string => {
    return JSON.stringify(knowledgeBase[host], null, 2);
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
  */

  return (
    <>
      <Flex alignItems="flex-start" mb="2">
        <Heading
          as="h5"
          size="sm"
          flex="1"
          overflowWrap="anywhere"
          lineHeight="1.5rem"
        >
          {!isDefaultKnowledge && (
            <Box
              position="relative"
              style={{ float: "right", marginTop: "-4px" }}
            >
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
        {rules.map((rule, ruleIndex) => {
          // Skip rules without notes
          if (
            rule.knowledge === undefined ||
            rule.knowledge.notes === undefined ||
            rule.knowledge.notes.length === 0
          ) {
            return null;
          }
          return (
            <AccordionItem key={ruleIndex} backgroundColor="white">
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Instructions Set {ruleIndex + 1}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Notes notes={rule.knowledge.notes} />
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </>
  );
};

export default HostKnowledge;
