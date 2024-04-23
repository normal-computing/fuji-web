import React, { useState, useCallback } from "react";
import {
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Box,
  InputGroup,
  InputRightElement,
  IconButton,
  FormHelperText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Textarea,
} from "@chakra-ui/react";
import { DeleteIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Formik, Form, Field } from "formik";
import { useAppState } from "../../state/store";
import { type EditingData, type EditingRule } from "../../helpers/knowledge";
import DuplicateKnowledgeAlert from "./DuplicateKnowledgeAlert";

type NewKnowledgeFormProps = {
  isOpen: boolean;
  isEditMode?: boolean;
  editKnowledge?: EditingData;
  closeForm: () => void;
  defaultHost: string;
  currentURL: string;
};

const NewKnowledgeForm = ({
  isOpen,
  isEditMode = false,
  editKnowledge,
  closeForm,
  defaultHost,
  currentURL,
}: NewKnowledgeFormProps) => {
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const customKnowledgeBase = useAppState(
    (state) => state.settings.customKnowledgeBase,
  );

  const regexOptions = (newHost: string) => {
    const options = [
      { value: "all", label: "Match any URL on this host" },
      { value: "custom", label: "Custom pattern" },
    ];
    if (!isEditMode && newHost === defaultHost) {
      options.splice(1, 0, {
        value: "one",
        label: "Match only the current URL",
      });
    }
    return options;
  };

  const normalizedHostName = (originalHostName: string): string => {
    let host = originalHostName !== "" ? originalHostName : defaultHost;
    host = host.startsWith("www.") ? host.slice(4) : host;
    return host;
  };

  const initialValues = {
    newHost: isEditMode && editKnowledge ? editKnowledge.host : defaultHost,
    rules:
      isEditMode && editKnowledge
        ? editKnowledge.rules
        : [
            {
              regexType: "",
              regexes: [""],
              knowledge: {
                notes: [""],
                annotationRules: [
                  {
                    selector: "",
                    useAttributeAsName: "",
                    useStaticName: "",
                    allowInvisible: false,
                    allowCovered: false,
                    allowAriaHidden: false,
                  },
                ],
              },
            },
          ],
  };

  const saveKnowledge = useCallback(
    (host: string, rules: EditingRule[]) => {
      const transformedRules = rules.map(({ regexes, knowledge }) => {
        return {
          regexes,
          knowledge,
        };
      });
      const updatedKnowledge = {
        ...customKnowledgeBase,
        [host]: { rules: transformedRules },
      };
      updateSettings({ customKnowledgeBase: updatedKnowledge });
      closeForm();
    },
    [customKnowledgeBase, updateSettings, closeForm],
  );

  // const renderAnnotationRules = () => (
  //   <>
  //     <HStack>
  //       <Heading as="h5" size="sm">
  //         Annotation Rules
  //       </Heading>
  //       <IconButton
  //         aria-label="Add another annotation"
  //         icon={<AddIcon />}
  //         size="sm"
  //         variant="ghost"
  //         onClick={() => {
  //           const newAnnotationRule = {
  //             selector: "",
  //             useAttributeAsName: "",
  //             useStaticName: "",
  //             allowInvisible: false,
  //             allowCovered: false,
  //             allowAriaHidden: false,
  //           };
  //           const updatedAnnotationRules = (
  //             values.rules[ruleIndex].knowledge.annotationRules ?? []
  //           ).concat(newAnnotationRule);
  //           setFieldValue(
  //             `rules[${ruleIndex}].knowledge.annotationRules`,
  //             updatedAnnotationRules,
  //           );
  //         }}
  //       />
  //     </HStack>
  //     {rule.knowledge.annotationRules?.map((annotation, aIndex) => (
  //       <Box
  //         key={aIndex}
  //         borderWidth="1px"
  //         borderRadius="lg"
  //         p={4}
  //         position="relative"
  //       >
  //         <IconButton
  //           aria-label="Remove annotation"
  //           icon={<DeleteIcon />}
  //           position="absolute"
  //           right={1}
  //           top={1}
  //           size="sm"
  //           colorScheme="red"
  //           variant="ghost"
  //           onClick={() => {
  //             const updatedAnnotationRules = [
  //               ...(values.rules[ruleIndex].knowledge
  //                 .annotationRules || []),
  //             ];
  //             updatedAnnotationRules.splice(aIndex, 1);
  //             setFieldValue(
  //               `rules[${ruleIndex}].knowledge.annotationRules`,
  //               updatedAnnotationRules,
  //             );
  //           }}
  //         />
  //         <FormControl mb={2}>
  //           <FormLabel>Selector</FormLabel>
  //           <Field
  //             as={Input}
  //             name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].selector`}
  //             placeholder="Enter selector"
  //           />
  //         </FormControl>

  //         <FormControl mb={2}>
  //           <FormLabel>useAttributeAsName</FormLabel>
  //           <Field
  //             as={Input}
  //             name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].useAttributeAsName`}
  //             placeholder="Enter attribute to use as name"
  //           />
  //         </FormControl>

  //         <FormControl mb={2}>
  //           <FormLabel>useStaticName</FormLabel>
  //           <Input
  //             name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].useStaticName`}
  //             value={annotation.useStaticName}
  //             onChange={handleChange}
  //             placeholder="Enter static name"
  //           />
  //         </FormControl>

  //         <FormControl display="flex" alignItems="center" mb={2}>
  //           <FormLabel mb="0">allowInvisible</FormLabel>
  //           <Switch
  //             ml={2}
  //             isChecked={annotation.allowInvisible}
  //             onChange={handleChange}
  //             name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].allowInvisible`}
  //           />
  //         </FormControl>

  //         <FormControl display="flex" alignItems="center" mb={2}>
  //           <FormLabel mb="0">allowCovered</FormLabel>
  //           <Switch
  //             ml={2}
  //             isChecked={annotation.allowCovered}
  //             onChange={handleChange}
  //             name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].allowCovered`}
  //           />
  //         </FormControl>

  //         <FormControl display="flex" alignItems="center" mb={2}>
  //           <FormLabel mb="0">allowAriaHidden</FormLabel>
  //           <Switch
  //             ml={2}
  //             isChecked={annotation.allowAriaHidden}
  //             onChange={handleChange}
  //             name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].allowAriaHidden`}
  //           />
  //         </FormControl>
  //       </Box>
  //     ))}
  //   </>
  // )

  return (
    <Modal isOpen={isOpen} onClose={closeForm} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            const { newHost, rules } = values;
            const host = normalizedHostName(newHost);
            if (!isEditMode && host in customKnowledgeBase) {
              setShowDuplicateAlert(true);
            } else {
              saveKnowledge(host, rules);
            }
          }}
        >
          {({ values, handleChange, setFieldValue }) => (
            <Form>
              <DuplicateKnowledgeAlert
                host={values.newHost}
                isOpen={showDuplicateAlert}
                onSave={() => {
                  const host = normalizedHostName(values.newHost);
                  saveKnowledge(host, values.rules);
                  setShowDuplicateAlert(false);
                }}
                onClose={() => setShowDuplicateAlert(false)}
              />
              <ModalHeader>
                {isEditMode ? "Edit" : "New"} Instructions
              </ModalHeader>
              <ModalBody>
                <FormControl isRequired mb={4}>
                  <FormLabel>Instructions for:</FormLabel>
                  <FormHelperText mb={1} fontSize="xs">
                    host of the website (e.g. google.com)
                  </FormHelperText>
                  <Input
                    name="newHost"
                    onChange={handleChange}
                    value={values.newHost}
                    placeholder="Enter host name"
                    disabled={isEditMode}
                  />
                </FormControl>

                {/* Rules Section */}
                {values.rules.map((rule, ruleIndex) => (
                  <Box
                    key={ruleIndex}
                    borderWidth="1px"
                    borderRadius="lg"
                    p={4}
                    position="relative"
                    mb={2}
                  >
                    {values.rules.length > 1 && (
                      <IconButton
                        aria-label="Remove rule"
                        icon={<DeleteIcon />}
                        position="absolute"
                        right={1}
                        top={1}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        zIndex="docked"
                        onClick={() => {
                          const updatedRules = values.rules.filter(
                            (_, idx) => idx !== ruleIndex,
                          );
                          setFieldValue("rules", updatedRules);
                        }}
                      />
                    )}
                    {!isEditMode && (
                      <FormControl isRequired mb={2}>
                        <FormLabel>URL Matching</FormLabel>
                        <FormHelperText mb={2} fontSize="xs">
                          Select a pattern to match URLs. Use &quot;Custom
                          Pattern&quot; for advanced pathname matching using
                          regular expressions.
                        </FormHelperText>
                        <Field
                          as={Select}
                          name={`rules[${ruleIndex}].regexType`}
                          placeholder="Select a matching pattern"
                          onChange={(
                            e: React.ChangeEvent<HTMLSelectElement>,
                          ) => {
                            const value = e.target.value;
                            setFieldValue(
                              `rules[${ruleIndex}].regexType`,
                              value,
                            );
                            switch (value) {
                              case "all":
                                setFieldValue(
                                  `rules[${ruleIndex}].regexes[0]`,
                                  ".*",
                                );
                                break;
                              case "one": {
                                let pathname;
                                try {
                                  pathname = new URL(
                                    currentURL,
                                  ).pathname.replace(
                                    /[-\\^$*+?.()|[\]{}]/g,
                                    "\\$&",
                                  );
                                } catch (error) {
                                  console.error("Error parsing URL: ", error);
                                }
                                setFieldValue(
                                  `rules[${ruleIndex}].regexes[0]`,
                                  `^${pathname}/?$`,
                                );
                                break;
                              }
                              case "custom":
                                setFieldValue(
                                  `rules[${ruleIndex}].regexes[0]`,
                                  "",
                                );
                                break;
                              default:
                                break;
                            }
                          }}
                        >
                          {regexOptions(values.newHost).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Field>
                      </FormControl>
                    )}
                    {rule.regexes.map((regex, regexIndex) => (
                      <FormControl key={regexIndex} isRequired>
                        <InputGroup size="md" mb={1}>
                          <Field
                            as={Input}
                            name={`rules[${ruleIndex}].regexes[${regexIndex}]`}
                            placeholder="Enter regex to match pathname"
                            isDisabled={rule.regexType !== "custom"}
                          />
                          <InputRightElement>
                            {rule.regexes.length > 1 && (
                              <IconButton
                                aria-label="Remove regex"
                                icon={<SmallCloseIcon />}
                                variant="ghost"
                                onClick={() => {
                                  const updatedRegexes = [
                                    ...values.rules[ruleIndex].regexes,
                                  ];
                                  updatedRegexes.splice(regexIndex, 1);
                                  setFieldValue(
                                    `rules[${ruleIndex}].regexes`,
                                    updatedRegexes,
                                  );
                                }}
                              />
                            )}
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                    ))}
                    {rule.regexType === "custom" && (
                      <Button
                        aria-label="Add another URL matching pattern"
                        size="sm"
                        variant="link"
                        colorScheme="blue"
                        mb={2}
                        onClick={() => {
                          const updatedRegexes =
                            values.rules[ruleIndex].regexes.concat("");
                          setFieldValue(
                            `rules[${ruleIndex}].regexes`,
                            updatedRegexes,
                          );
                        }}
                      >
                        Add more pattern
                      </Button>
                    )}

                    {/* Notes Section */}
                    <FormControl mb={2}>
                      <FormLabel>Instructions</FormLabel>
                      {rule.knowledge.notes?.map((note, noteIndex) => (
                        <InputGroup key={noteIndex} size="md" mb={1}>
                          <Field
                            as={Textarea}
                            name={`rules[${ruleIndex}].knowledge.notes[${noteIndex}]`}
                            placeholder="Enter Instructions"
                          />
                          <InputRightElement>
                            {rule.knowledge.notes &&
                              rule.knowledge.notes.length > 1 && (
                                <IconButton
                                  aria-label="Remove Instructions"
                                  icon={<SmallCloseIcon />}
                                  variant="ghost"
                                  onClick={() => {
                                    const updatedNotes = [
                                      ...(values.rules[ruleIndex].knowledge
                                        .notes || []),
                                    ];
                                    updatedNotes.splice(noteIndex, 1);
                                    setFieldValue(
                                      `rules[${ruleIndex}].knowledge.notes`,
                                      updatedNotes,
                                    );
                                  }}
                                />
                              )}
                          </InputRightElement>
                        </InputGroup>
                      ))}
                    </FormControl>
                    <Button
                      size="sm"
                      variant="link"
                      colorScheme="blue"
                      onClick={() => {
                        const updatedNotes = (
                          values.rules[ruleIndex].knowledge.notes || []
                        ).concat("");
                        setFieldValue(
                          `rules[${ruleIndex}].knowledge.notes`,
                          updatedNotes,
                        );
                      }}
                    >
                      Add another instruction
                    </Button>

                    {/* Annotation Rules Section */}
                    {/* {renderAnnotationRules()} */}
                  </Box>
                ))}
                <Button
                  size="sm"
                  variant="link"
                  colorScheme="blue"
                  onClick={() => {
                    const newRule = {
                      regexType: "all",
                      regexes: [".*"],
                      knowledge: {
                        notes: [""],
                        annotationRules: [
                          {
                            selector: "",
                            useAttributeAsName: "",
                            useStaticName: "",
                            allowInvisible: false,
                            allowCovered: false,
                            allowAriaHidden: false,
                          },
                        ],
                      },
                    };
                    const updatedRules = values.rules.concat(newRule);
                    setFieldValue("rules", updatedRules);
                  }}
                >
                  Add another set of instructions
                </Button>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} type="submit">
                  Save
                </Button>
                <Button onClick={closeForm}>Cancel</Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
};

export default NewKnowledgeForm;
