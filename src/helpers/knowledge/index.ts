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

export type Data = {
  [host: string]: {
    rules?: {
      regexes: string[];
      knowledge: Knowledge;
    }[];
  };
};

export type LocationInfo = {
  host: string;
  pathname: string;
};

export function fetchKnowledge(
  location: LocationInfo,
  customHostData: Data,
): Knowledge {
  // TODO: fetch from a server
  const data = _db as Data;
  const redirects = _redirects as Redirects;
  let result: Knowledge = {
    notes: [],
    annotationRules: [],
  };

  const { host, pathname } = location;
  if (redirects[host] != null) {
    return fetchKnowledge({ host: redirects[host], pathname }, customHostData);
  }
  const hostData = data[host];
  if (hostData) {
    result = mergeKnowledge(result, hostData, location.pathname);
  }

  const customData = customHostData[host];
  if (customData) {
    result = mergeKnowledge(result, customData, location.pathname);
  }

  return result;
}

function mergeKnowledge(
  result: Knowledge,
  dataSource: { rules?: { regexes: string[]; knowledge: Knowledge }[] },
  pathname: string,
): Knowledge {
  const rules = dataSource.rules;
  if (rules != null) {
    for (const rule of rules) {
      for (const regex of rule.regexes) {
        if (new RegExp(regex, "i").test(pathname)) {
          // merge all matching rules
          result.notes = result.notes?.concat(rule.knowledge.notes ?? []);
          result.annotationRules = result.annotationRules?.concat(
            rule.knowledge.annotationRules ?? [],
          );
        }
      }
    }
  }
  return result;
}
