import React, { useState } from "react";
import { Button, Text, VStack, Box } from "@chakra-ui/react";
import { useAppState } from "@root/src/state/store";
import NewKnowledgeForm from "./NewKnowledgeForm";
import { type EditingData } from "../../helpers/knowledge";
import DefaultKnowledge from "./DefaultKnowledge";
import HostKnowledge from "./HostKnowledge";
// import NewKnowledgeJson from "./NewKnowledgeJson";
import { findActiveTab } from "../../helpers/browserUtils";

const CustomKnowledgeBase = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editKnowledge, setEditKnowledge] = useState<EditingData | undefined>(
    undefined,
  );
  const customKnowledgeBase = useAppState(
    (state) => state.settings.customKnowledgeBase,
  );
  // const {
  //   isOpen: isJsonInputOpen,
  //   onOpen: openJsonInput,
  //   onClose: closeJsonInput,
  // } = useDisclosure();
  const [defaultHost, setDefaultHost] = useState("");
  const [currentURL, setCurrentUrl] = useState("");

  const openForm = async () => {
    const tab = await findActiveTab();
    if (tab && tab.url) {
      setCurrentUrl(tab.url);
      if (tab.url.startsWith("chrome")) {
        setDefaultHost("");
      } else {
        const url = new URL(tab.url);
        const host = url.hostname.replace(/^www\./, "");
        setDefaultHost(host);
      }
    }
    setIsFormOpen(true);
  };

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
        <Text>No instructions found</Text>
      )}
      <Button onClick={openForm}>Add Instructions</Button>
      {/* <Button onClick={openJsonInput}>Add Host Knowledge with JSON</Button> */}
      <NewKnowledgeForm
        isOpen={isFormOpen}
        isEditMode={!!editKnowledge}
        editKnowledge={editKnowledge}
        closeForm={closeForm}
        defaultHost={defaultHost}
        currentURL={currentURL}
      />
      {/* <NewKnowledgeJson isOpen={isJsonInputOpen} onClose={closeJsonInput} /> */}
    </VStack>
  );
};

export default CustomKnowledgeBase;
