import React, { useState, useEffect } from "react";
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
  Heading,
  Switch,
  InputGroup,
  InputRightElement,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Formik, Form, Field } from "formik";
import { findActiveTab } from "../helpers/browserUtils";
import { useAppState } from "../state/store";
import { type EditingData } from "../helpers/knowledge";

type NewKnowledgeFormProps = {
  isEditMode?: boolean;
  editKnowledge?: EditingData;
  onSaved: () => void;
};

const NewKnowledgeForm = ({
  isEditMode = false,
  editKnowledge,
  onSaved,
}: NewKnowledgeFormProps) => {
  const [defaultHost, setDefaultHost] = useState("");
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const customKnowledgeBase = useAppState(
    (state) => state.settings.customKnowledgeBase,
  );

  useEffect(() => {
    const handleOpenNewKnowledgeForm = async () => {
      const tab = await findActiveTab();
      if (tab && tab.url) {
        const url = new URL(tab.url);
        const host = url.hostname.replace(/^www\./, "");
        setDefaultHost(host);
      }
    };

    if (!isEditMode) {
      handleOpenNewKnowledgeForm();
    }
  }, [isEditMode]);

  const regexOptions = [
    { value: "all", label: "Any URL on this host" },
    { value: "one", label: "Only this URL" },
    { value: "custom", label: "Custom regex" },
  ];

  const initialValues = {
    newHost: isEditMode && editKnowledge ? editKnowledge.host : defaultHost,
    rules:
      isEditMode && editKnowledge
        ? editKnowledge.rules
        : [
            {
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
            },
          ],
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values) => {
        const { newHost, rules } = values;
        const host = newHost !== "" ? newHost : defaultHost;
        const transformedRules = rules.map(
          ({ regexType, regexes, knowledge }) => {
            let transformedRegexes = regexes;
            switch (regexType) {
              case "all":
                transformedRegexes = [".*"];
                break;
              case "one":
                transformedRegexes = [
                  `^https?://${host.replace(/\./g, "\\.")}/?$`,
                ];
                break;
              default:
                break;
            }
            return {
              regexes: transformedRegexes,
              knowledge,
            };
          },
        );
        const updatedKnowledge = {
          ...customKnowledgeBase,
          [host]: { rules: transformedRules },
        };
        updateSettings({ customKnowledgeBase: updatedKnowledge });
        onSaved();
      }}
    >
      {({ values, handleChange, setFieldValue }) => (
        <Form>
          <ModalHeader>New Host Knowledge</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Host</FormLabel>
              <Input
                name="newHost"
                onChange={handleChange}
                value={values.newHost || defaultHost}
                placeholder="Enter host name"
              />
            </FormControl>

            {/* Rules Section */}
            <HStack mt={4} mb={3}>
              <Heading as="h4" size="md">
                Rules
              </Heading>
              <IconButton
                aria-label="Add another rule"
                icon={<AddIcon />}
                size="sm"
                variant="ghost"
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
              />
            </HStack>
            {values.rules.map((rule, ruleIndex) => (
              <Box
                key={ruleIndex}
                borderWidth="1px"
                borderRadius="lg"
                p={4}
                position="relative"
              >
                <IconButton
                  aria-label="Remove rule"
                  icon={<DeleteIcon />}
                  position="absolute"
                  right={1}
                  top={1}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => {
                    const updatedRules = values.rules.filter(
                      (_, idx) => idx !== ruleIndex,
                    );
                    setFieldValue("rules", updatedRules);
                  }}
                />
                <FormControl isRequired mb={2}>
                  <HStack>
                    <FormLabel>Regexes</FormLabel>
                    <IconButton
                      aria-label="Add another regex"
                      icon={<AddIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const updatedRegexes =
                          values.rules[ruleIndex].regexes.concat("");
                        setFieldValue(
                          `rules[${ruleIndex}].regexes`,
                          updatedRegexes,
                        );
                      }}
                    />
                  </HStack>
                  <Field
                    as={Select}
                    name={`rules[${ruleIndex}].regexType`}
                    placeholder="Select regex type"
                  >
                    {regexOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Field>
                </FormControl>

                {rule.regexType === "custom" &&
                  rule.regexes.map((regex, regexIndex) => (
                    <InputGroup key={regexIndex} size="md">
                      <Field
                        as={Input}
                        name={`rules[${ruleIndex}].regexes[${regexIndex}]`}
                        placeholder="Enter regex"
                      />
                      <InputRightElement>
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
                      </InputRightElement>
                    </InputGroup>
                  ))}

                {/* Notes Section */}
                <FormControl mb={2}>
                  <HStack>
                    <FormLabel>Notes</FormLabel>
                    <IconButton
                      aria-label="Add another note"
                      icon={<AddIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const updatedNotes = (
                          values.rules[ruleIndex].knowledge.notes || []
                        ).concat("");
                        setFieldValue(
                          `rules[${ruleIndex}].knowledge.notes`,
                          updatedNotes,
                        );
                      }}
                    />
                  </HStack>
                  {rule.knowledge.notes?.map((note, noteIndex) => (
                    <InputGroup key={noteIndex} size="md">
                      <Field
                        as={Input}
                        name={`rules[${ruleIndex}].knowledge.notes[${noteIndex}]`}
                        placeholder="Enter note"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label="Remove note"
                          icon={<SmallCloseIcon />}
                          variant="ghost"
                          onClick={() => {
                            const updatedNotes = [
                              ...(values.rules[ruleIndex].knowledge.notes ||
                                []),
                            ];
                            updatedNotes.splice(noteIndex, 1);
                            setFieldValue(
                              `rules[${ruleIndex}].knowledge.notes`,
                              updatedNotes,
                            );
                          }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  ))}
                </FormControl>

                {/* Annotation Rules Section */}
                <HStack>
                  <Heading as="h5" size="sm">
                    Annotation Rules
                  </Heading>
                  <IconButton
                    aria-label="Add another annotation"
                    icon={<AddIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const newAnnotationRule = {
                        selector: "",
                        useAttributeAsName: "",
                        useStaticName: "",
                        allowInvisible: false,
                        allowCovered: false,
                        allowAriaHidden: false,
                      };
                      const updatedAnnotationRules = (
                        values.rules[ruleIndex].knowledge.annotationRules ?? []
                      ).concat(newAnnotationRule);
                      setFieldValue(
                        `rules[${ruleIndex}].knowledge.annotationRules`,
                        updatedAnnotationRules,
                      );
                    }}
                  />
                </HStack>
                {rule.knowledge.annotationRules?.map((annotation, aIndex) => (
                  <Box
                    key={aIndex}
                    borderWidth="1px"
                    borderRadius="lg"
                    p={4}
                    position="relative"
                  >
                    <IconButton
                      aria-label="Remove annotation"
                      icon={<DeleteIcon />}
                      position="absolute"
                      right={1}
                      top={1}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => {
                        const updatedAnnotationRules = [
                          ...(values.rules[ruleIndex].knowledge
                            .annotationRules || []),
                        ];
                        updatedAnnotationRules.splice(aIndex, 1);
                        setFieldValue(
                          `rules[${ruleIndex}].knowledge.annotationRules`,
                          updatedAnnotationRules,
                        );
                      }}
                    />
                    <FormControl mb={2}>
                      <FormLabel>Selector</FormLabel>
                      <Field
                        as={Input}
                        name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].selector`}
                        placeholder="Enter selector"
                      />
                    </FormControl>

                    <FormControl mb={2}>
                      <FormLabel>useAttributeAsName</FormLabel>
                      <Field
                        as={Input}
                        name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].useAttributeAsName`}
                        placeholder="Enter attribute to use as name"
                      />
                    </FormControl>

                    <FormControl mb={2}>
                      <FormLabel>useStaticName</FormLabel>
                      <Input
                        name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].useStaticName`}
                        value={annotation.useStaticName}
                        onChange={handleChange}
                        placeholder="Enter static name"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center" mb={2}>
                      <FormLabel mb="0">allowInvisible</FormLabel>
                      <Switch
                        ml={2}
                        isChecked={annotation.allowInvisible}
                        onChange={handleChange}
                        name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].allowInvisible`}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center" mb={2}>
                      <FormLabel mb="0">allowCovered</FormLabel>
                      <Switch
                        ml={2}
                        isChecked={annotation.allowCovered}
                        onChange={handleChange}
                        name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].allowCovered`}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center" mb={2}>
                      <FormLabel mb="0">allowAriaHidden</FormLabel>
                      <Switch
                        ml={2}
                        isChecked={annotation.allowAriaHidden}
                        onChange={handleChange}
                        name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].allowAriaHidden`}
                      />
                    </FormControl>
                  </Box>
                ))}
              </Box>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} type="submit">
              Save
            </Button>
            <Button onClick={onSaved}>Cancel</Button>
          </ModalFooter>
        </Form>
      )}
    </Formik>
  );
};

export default NewKnowledgeForm;
