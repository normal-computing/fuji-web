function base64ToBlob(base64: string, mimeType = "") {
  const byteCharacters = atob(base64);
  const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export default function attachFile(data: string, selector: string) {
  const screenshotBlob = base64ToBlob(data, "image/png");
  // Create a virtual input element
  const input = document.createElement("input");
  input.type = "file";
  input.style.display = "none";

  // Append to the document
  document.body.appendChild(input);

  // Simulate file input for the screenshot blob
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(new File([screenshotBlob], "screenshot.png"));
  input.files = dataTransfer.files;

  // Find the actual file input on the page and set its files property
  const actualFileInput = document.querySelector(selector) as HTMLInputElement;
  console.log(actualFileInput, selector);
  if (!actualFileInput) {
    console.log("could not find file input");
    return;
  }
  actualFileInput.files = input.files;
  console.log(actualFileInput.files);

  actualFileInput.dispatchEvent(
    new Event("input", { bubbles: true, composed: true }),
  );
  actualFileInput.dispatchEvent(new Event("change", { bubbles: true }));

  // Clean up
  document.body.removeChild(input);
}
