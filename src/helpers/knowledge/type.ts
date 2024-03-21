export type DomainRules = {
  domain: string;
  rules: Rule[];
};

export type Rule = {
  regexes: string[];
  knowledge: {
    notes: string[];
    annotationRules?: {
      selector: string;
      useAttributeAsName?: string;
      allowInvisible: boolean;
      allowCovered: boolean;
      allowAriaHidden: boolean;
    }[];
  };
};
