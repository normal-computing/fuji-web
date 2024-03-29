import _db from "./db.json" assert { type: "json" };
import _redirects from "./redirects.json" assert { type: "json" };

type Redirects = {
  [host: string]: string;
};
export type AnnotationRule = {
  selector: string;
  useStaticName?: string;
  useAttributeAsName?: string;
  allowInvisible?: boolean;
  allowAriaHidden?: boolean;
  allowCovered?: boolean;
};

export type Knowledge = {
  notes?: string[];
  annotationRules?: AnnotationRule[];
};

export type Rule = {
  regexes: string[];
  knowledge: Knowledge;
};

export type Data = {
  [host: string]: {
    rules?: Rule[];
  };
};

// rule type used only in editing mode
export type EditingRule = Rule & {
  regexType: string;
};

// data type used only in editing mode
export type EditingData = {
  host: string;
  rules: EditingRule[];
};

export type LocationInfo = {
  host: string;
  pathname: string;
};

export function fetchKnowledge(
  location: LocationInfo,
  customKnowledgeBase?: Data,
): Knowledge {
  // TODO: fetch from a server
  const data = _db as Data;
  const redirects = _redirects as Redirects;
  let result: Knowledge = {
    notes: [],
    annotationRules: [],
  };

  const { host, pathname } = location;
  const normalizedHosts = getNormalizedHosts(host, redirects);

  for (const searchHost of normalizedHosts) {
    const hostKnowledge = data[searchHost] || customKnowledgeBase?.[searchHost];
    if (hostKnowledge) {
      result = mergeKnowledge(result, hostKnowledge, pathname);
    }
  }

  return result;
}

function getNormalizedHosts(host: string, redirects: Redirects): string[] {
  const hostWithWww = host.startsWith("www.") ? host : `www.${host}`;
  const hostWithoutWww = host.startsWith("www.") ? host.slice(4) : host;
  const redirectedHostWithWww = redirects[hostWithWww] || hostWithWww;
  const redirectedHostWithoutWww = redirects[hostWithoutWww] || hostWithoutWww;
  return [
    ...new Set([
      hostWithWww,
      hostWithoutWww,
      redirectedHostWithWww,
      redirectedHostWithoutWww,
    ]),
  ];
}

function mergeKnowledge(
  result: Knowledge,
  dataSource: { rules?: Rule[] },
  pathname: string,
): Knowledge {
  const rules = dataSource.rules;
  if (rules != null) {
    for (const rule of rules) {
      for (const regex of rule.regexes) {
        if (new RegExp(regex, "i").test(pathname)) {
          // merge all matching rules
          result.notes = result.notes?.concat(rule.knowledge.notes ?? []);

          // filter out invalid annotaion rules
          const filteredAnnotationRules =
            rule.knowledge.annotationRules?.filter(
              (rule) => rule.selector !== "",
            ) ?? [];
          result.annotationRules = result.annotationRules?.concat(
            filteredAnnotationRules,
          );
        }
      }
    }
  }
  return result;
}

export function fetchAllDefaultKnowledge(): Data {
  return _db as Data;
}
