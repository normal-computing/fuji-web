import { sleep } from "../../helpers/utils";

export default function ripple(x: number, y: number) {
  const rippleRadius = 30;
  const ripple = document.createElement("div");
  ripple.classList.add("web-agent-ripple");
  ripple.style.width = ripple.style.height = `${rippleRadius * 2}px`;
  // Take scroll position into account
  ripple.style.top = `${window.scrollY + y - rippleRadius}px`;
  ripple.style.left = `${x - rippleRadius}px`;

  document.body.appendChild(ripple);

  // remove after the animation to finish
  // but we don't need to `await` it
  sleep(800).then(() => {
    ripple.remove();
  });
}
