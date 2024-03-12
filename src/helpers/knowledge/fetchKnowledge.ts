import db from "./db.json";

type Data = {
  [host: string]: {
    redirect?: string;
    rules?: {
      regexes: string[];
      knowledge: string[];
    }[];
  };
};

export type LocationInfo = {
  host: string;
  pathname: string;
};

export function fetchKnowledge(location: LocationInfo): string[] {
  console.log(location);
  // TODO: fetch from a server
  const data = db as unknown as Data;
  let result: string[] = [];

  const { host, pathname } = location;
  const hostData = data[host];
  if (hostData) {
    if (hostData.redirect != null) {
      return fetchKnowledge({ host: hostData.redirect, pathname });
    }
    const rules = hostData.rules;
    if (rules != null) {
      for (const rule of rules) {
        for (const regex of rule.regexes) {
          if (new RegExp(regex, "i").test(pathname)) {
            result = result.concat(rule.knowledge);
          }
        }
      }
    }
  }
  return result;
}
