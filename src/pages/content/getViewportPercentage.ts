export default function getViewportPercentage(): number {
  // Total height of the document
  const documentHeight: number = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight,
  );

  // Viewport height
  const viewportHeight: number = window.innerHeight;
  // How much has been scrolled
  const scrollY: number = window.scrollY;

  // Calculate the end of the current viewport position as a percentage of the total document height
  const percentage: number =
    ((scrollY + viewportHeight) / documentHeight) * 100;

  return percentage;
}
