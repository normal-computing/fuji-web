export function getDataFromRenderedMarkdown(selector: string) {
  const element = document.querySelector(selector);
  if (!element) {
    return null;
  }
  const text = Array.from(element.querySelectorAll("p"))
    .map((p) => p.textContent)
    .join("\n\n");
  const codeBlocks = Array.from(element.querySelectorAll("pre code")).map(
    (code) => code.textContent,
  );

  return { text, codeBlocks };
}
