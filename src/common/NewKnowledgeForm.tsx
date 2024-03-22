// NewKnowledgeForm.tsx
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
} from "@chakra-ui/react";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { useFormik } from "formik";
import { findActiveTab } from "../helpers/browserUtils";
import { useAppState } from "../state/store";

type NewKnowledgeFormProps = {
  isEditMode?: boolean;
  editData?: {
    host: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rules: any[];
  };
  onSaved: () => void;
};

const NewKnowledgeForm = ({
  isEditMode = false,
  editData,
  onSaved,
}: NewKnowledgeFormProps) => {
  const [defaultHost, setDefaultHost] = useState("");
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const hostData = useAppState((state) => state.settings.hostData);

  const formik = useFormik({
    initialValues: {
      newHost: "",
      rules: [
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
    },
    onSubmit: (values) => {
      const { newHost, rules } = values;
      const host =
        isEditMode && editData
          ? editData.host
          : newHost !== ""
            ? newHost
            : defaultHost;

      // Transform rules to exclude 'regexType' before submission
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
            case "custom":
              // For 'custom', we already have the correct regexes array
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

      const updatedHostData = {
        ...hostData,
        [host]: { rules: transformedRules },
      };
      updateSettings({ hostData: updatedHostData });
      onSaved();
    },
  });

  useEffect(() => {
    if (isEditMode && editData) {
      formik.setValues({
        newHost: editData.host,
        rules: editData.rules,
      });
    } else {
      formik.resetForm();
      if (!isEditMode) {
        handleOpenNewKnowledgeForm();
      }
    }
  }, [isEditMode]);

  const handleOpenNewKnowledgeForm = async () => {
    const tab = await findActiveTab();
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const host = url.hostname.replace(/^www\./, "");
      setDefaultHost(host);
      formik.setFieldValue("newHost", host);
    }
  };

  const addRule = () => {
    const newRule = {
      regexesType: "all",
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
    formik.setFieldValue("rules", [...formik.values.rules, newRule]);
  };

  const removeRule = (index: number) => {
    const updatedRules = formik.values.rules.filter((_, idx) => idx !== index);
    formik.setFieldValue("rules", updatedRules);
  };

  const addNote = (ruleIndex: number) => {
    const updatedRules = [...formik.values.rules];
    updatedRules[ruleIndex].knowledge.notes.push("");
    formik.setFieldValue("rules", updatedRules);
  };

  const removeNote = (ruleIndex: number, noteIndex: number) => {
    const updatedRules = [...formik.values.rules];
    updatedRules[ruleIndex].knowledge.notes.splice(noteIndex, 1);
    formik.setFieldValue("rules", updatedRules);
  };

  const addAnnotation = (ruleIndex: number) => {
    const newAnnotationRule = {
      selector: "",
      useAttributeAsName: "",
      useStaticName: "",
      allowInvisible: false,
      allowCovered: false,
      allowAriaHidden: false,
    };

    const updatedRules = [...formik.values.rules];
    updatedRules[ruleIndex].knowledge.annotationRules.push(newAnnotationRule);
    formik.setFieldValue("rules", updatedRules);
  };

  const removeAnnotation = (ruleIndex: number, annotationIndex: number) => {
    const updatedRules = [...formik.values.rules];
    updatedRules[ruleIndex].knowledge.annotationRules.splice(
      annotationIndex,
      1,
    );
    formik.setFieldValue("rules", updatedRules);
  };

  const addCustomRegex = (ruleIndex: number) => {
    const updatedRules = [...formik.values.rules];
    if (!updatedRules[ruleIndex].regexes) {
      updatedRules[ruleIndex].regexes = [""];
    } else {
      updatedRules[ruleIndex].regexes.push("");
    }
    formik.setFieldValue("rules", updatedRules);
  };

  const removeCustomRegex = (ruleIndex: number, regexIndex: number) => {
    const updatedRules = [...formik.values.rules];
    updatedRules[ruleIndex].regexes.splice(regexIndex, 1);
    if (updatedRules[ruleIndex].regexes.length === 0) {
      updatedRules[ruleIndex].regexes.push("");
    }
    formik.setFieldValue("rules", updatedRules);
  };

  const regexOptions = [
    { value: "all", label: "Any URL on this host" },
    { value: "one", label: "Only this URL" },
    { value: "custom", label: "Custom regex" },
  ];

  const renderAnnotationRules = (ruleIndex, annotation, aIndex) => (
    <Box key={aIndex} borderWidth="1px" borderRadius="lg" p={4} mt={2}>
      <FormControl>
        <FormLabel>selector</FormLabel>
        <Input
          name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].selector`}
          value={annotation.selector}
          onChange={formik.handleChange}
          placeholder="Enter selector"
        />
      </FormControl>

      <FormControl mt={2}>
        <FormLabel>useAttributeAsName</FormLabel>
        <Input
          name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].useAttributeAsName`}
          value={annotation.useAttributeAsName}
          onChange={formik.handleChange}
          placeholder="Enter attribute to use as name"
        />
      </FormControl>

      <FormControl mt={2}>
        <FormLabel>useStaticName</FormLabel>
        <Input
          name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].useStaticName`}
          value={annotation.useStaticName}
          onChange={formik.handleChange}
          placeholder="Enter static name"
        />
      </FormControl>

      <FormControl display="flex" alignItems="center" mt={2}>
        <FormLabel mb="0">allowInvisible</FormLabel>
        <Switch
          ml={2}
          isChecked={annotation.allowInvisible}
          onChange={formik.handleChange}
          name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].allowInvisible`}
        />
      </FormControl>

      <FormControl display="flex" alignItems="center" mt={2}>
        <FormLabel mb="0">allowCovered</FormLabel>
        <Switch
          ml={2}
          isChecked={annotation.allowCovered}
          onChange={formik.handleChange}
          name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].allowCovered`}
        />
      </FormControl>

      <FormControl display="flex" alignItems="center" mt={2}>
        <FormLabel mb="0">allowAriaHidden</FormLabel>
        <Switch
          ml={2}
          isChecked={annotation.allowAriaHidden}
          onChange={formik.handleChange}
          name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].allowAriaHidden`}
        />
      </FormControl>

      <Button
        mt={2}
        colorScheme="red"
        onClick={() => removeAnnotation(ruleIndex, aIndex)}
      >
        Remove Annotation
      </Button>
    </Box>
  );

  return (
    <form onSubmit={formik.handleSubmit}>
      <ModalHeader>New Host Knowledge</ModalHeader>
      <ModalBody>
        <FormControl isRequired>
          <FormLabel>Host</FormLabel>
          <Input
            name="newHost"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.newHost || defaultHost}
            placeholder="Enter host name"
          />
        </FormControl>

        <Heading as="h4" size="md">
          Rules
        </Heading>
        {formik.values.rules.map((rule, ruleIndex) => (
          <Box key={ruleIndex} borderWidth="1px" borderRadius="lg" p={4}>
            <FormControl isRequired>
              <FormLabel>Regexes</FormLabel>
              <Select
                name={`rules[${ruleIndex}].regexType`}
                value={rule.regexType}
                onChange={formik.handleChange}
              >
                {regexOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {rule.regexType === "custom" &&
                rule.regexes.map((regex, regexIndex) => (
                  <InputGroup key={regexIndex} size="md" mb={2}>
                    <Input
                      name={`rules[${ruleIndex}].regexes[${regexIndex}]`}
                      value={regex}
                      onChange={formik.handleChange}
                      placeholder="Enter regex"
                    />
                    <InputRightElement width="4.5rem">
                      <IconButton
                        aria-label="Remove regex"
                        icon={<SmallCloseIcon />}
                        onClick={() => removeCustomRegex(ruleIndex, regexIndex)}
                      />
                    </InputRightElement>
                  </InputGroup>
                ))}
              <Button mt={2} onClick={() => addCustomRegex(ruleIndex)}>
                Add Regex
              </Button>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>notes</FormLabel>
              {rule.knowledge.notes.map((note, noteIndex) => (
                <InputGroup key={noteIndex} size="md" mb={2}>
                  <Input
                    name={`rules[${ruleIndex}].knowledge.notes[${noteIndex}]`}
                    value={note}
                    onChange={formik.handleChange}
                    placeholder="Enter note"
                  />
                  <InputRightElement width="4.5rem">
                    <IconButton
                      aria-label="Remove note"
                      icon={<SmallCloseIcon />}
                      onClick={() => removeNote(ruleIndex, noteIndex)}
                    />
                  </InputRightElement>
                </InputGroup>
              ))}
              <Button mt={2} onClick={() => addNote(ruleIndex)}>
                Add Note
              </Button>
            </FormControl>

            <Heading as="h5" size="sm" mt={4}>
              Annotation Rules
            </Heading>
            {rule.knowledge.annotationRules.map((annotation, aIndex) =>
              renderAnnotationRules(ruleIndex, annotation, aIndex),
            )}
            <Button mt={2} onClick={() => addAnnotation(ruleIndex)}>
              Add Annotation
            </Button>

            <Button
              mt={4}
              colorScheme="red"
              onClick={() => removeRule(ruleIndex)}
            >
              Remove Rule
            </Button>
          </Box>
        ))}
        <Button mt={4} onClick={addRule} colorScheme="blue">
          Add Another Rule
        </Button>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="blue" mr={3} type="submit">
          Save
        </Button>
        <Button onClick={onSaved}>Cancel</Button>
      </ModalFooter>
    </form>
  );
};

export default NewKnowledgeForm;
