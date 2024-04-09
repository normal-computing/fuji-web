import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { debugMode } from "../constants";

// returns true if the error is recoverable by retrying the query
export default function errorChecker(
  err: Error,
  notifyError?: (errMsg: string) => void,
): boolean {
  const log = (msg: string, e: Error) => {
    if (debugMode) {
      console.error(msg, e);
    }
    if (notifyError) {
      notifyError(msg);
    }
  };
  if (err instanceof OpenAI.APIError) {
    if (err instanceof OpenAI.InternalServerError) {
      log(
        "There is a problem with the OpenAI API server. Please check its status page https://status.openai.com/ and try again later.",
        err,
      );
      return false;
    }
    if (
      err instanceof OpenAI.AuthenticationError ||
      err instanceof OpenAI.PermissionDeniedError
    ) {
      log("The OpenAI API key you provided might not be valid", err);
      return false;
    }
    if (err instanceof OpenAI.APIConnectionError) {
      log(
        "There is a problem with the network connection to the OpenAI API. Please check your network connection and try again later.",
        err,
      );
      return true;
    }
    // other API errors are not recoverable
    return false;
  } else if (err instanceof Anthropic.APIError) {
    if (err instanceof Anthropic.InternalServerError) {
      log(
        "There is a problem with the Anthropic API server. Please check its status page https://status.anthropic.com/ and try again later.",
        err,
      );
      return false;
    }
    if (
      err instanceof Anthropic.AuthenticationError ||
      err instanceof Anthropic.PermissionDeniedError
    ) {
      log("The Anthropic API key you provided might not be valid", err);
      return false;
    }
    if (err instanceof Anthropic.APIConnectionError) {
      log(
        "There is a problem with the network connection to the Anthropic API. Please check your network connection and try again later.",
        err,
      );
      return true;
    }
    // other API errors are not recoverable
    return false;
  }
  log("Error: " + err.message, err);
  // retry everything else (e.g. network errors, syntax error, timeout)
  return true;
}
