// TypeScript function
function scrollIntoViewFunction() {
  // @ts-expect-error this is run in the browser context
  this.scrollIntoView({
    block: 'center',
    inline: 'center',
    // behavior: 'smooth',
  });
}
// Convert the TypeScript function to a string
export const scrollScriptString = scrollIntoViewFunction.toString();

function scrollUp() {
  window.scrollBy(0, -window.screen.height / 2);
}
function scrollDown() {
  window.scrollBy(0, window.screen.height / 2);
}
export const scrollUpString = scrollUp.toString();
export const scrollDownString = scrollDown.toString();
