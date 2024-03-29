import { DeleteIcon, CopyIcon, EditIcon } from "@chakra-ui/icons";
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
  useToast,
  Box,
} from "@chakra-ui/react";
import { fetchAllDefaultKnowledge } from "../../helpers/knowledge";
import { useAppState } from "@root/src/state/store";

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

export default HostKnowledge;
