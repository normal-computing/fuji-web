const styleElem = document.createElement('style');
styleElem.setAttribute('type', 'text/css');
styleElem.innerHTML = `
._label_overlay_wrapper {
  position: absolute;
  z-index: 9999;
  top: 0;
  left: 0;
}
._label_overlay {
  position: absolute;
  opacity: 0.75;
  font-size: 7px;
}
._label_overlay > span {
  background-color: black;
  color: #fff;
  border-radius: 2px;
  padding: 2px 5px;
  position: absolute;
  z-index: 1;
  top: 100%;
  left: 50%;
  transform: translate(-50%,2px);
}
._label_overlay > span::after {
  content: "";
  position: absolute;
  top: -8px;
  left: 50%;
  margin-left: -4px;
  border-width: 4px;
  border-style: solid;
  border-color: transparent transparent black transparent;
}
`;
document.head.appendChild(styleElem);

function isElementNode(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

function isVisible(element: Element, checkViewport = false) {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const { display, visibility, opacity } = style;
  if (display === 'none') return false;
  if (visibility !== 'visible') return false;
  if (opacity != null && parseFloat(opacity) < 0.1) return false; // considering something very close to 0 as invisible
  // also respect 'aria-hidden' attribute
  if (element.getAttribute('aria-hidden') === 'true') return false;

  if (rect.width === 0 || rect.height === 0) return false;

  // check if the element is within the viewport
  if (checkViewport) {
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;
    if (
      rect.top > windowHeight ||
      rect.bottom < 0 ||
      rect.left > windowWidth ||
      rect.right < 0
    )
      return false;
  }

  return true;
}

type DomAttrs = {
  visibleText: string;
  ariaLabel: string;
};

const emptyDomAttrs: DomAttrs = {
  visibleText: '',
  ariaLabel: '',
};

const visibleTextAttributeName = 'data-md-visible-text';
const ariaLabelArributeName = 'data-md-aria-label';
const labelAttributeName = 'data-md-label';

// check if the node has the attributes we added
function isTouchedElement(elem: Element) {
  return (
    elem.hasAttribute(visibleTextAttributeName) ||
    elem.hasAttribute(ariaLabelArributeName)
  );
}

// find the visible text and best-match aria-label of the element
// note that this function has a side effect of writing the attributes in the DOM
function traverseDom(node: Node, selector: string): DomAttrs {
  if (node.nodeType === Node.TEXT_NODE) {
    return { visibleText: node.nodeValue ?? '', ariaLabel: '' };
  } else if (isElementNode(node)) {
    if (!isVisible(node)) return emptyDomAttrs; // skip if the element is not visible
    if (isTouchedElement(node)) {
      return {
        visibleText: node.getAttribute(visibleTextAttributeName) ?? '',
        ariaLabel: node.getAttribute(ariaLabelArributeName) ?? '',
      };
    }

    let visibleText = '';
    let ariaLabel = '';
    if (node.hasAttribute('aria-label')) {
      ariaLabel = node.getAttribute('aria-label') ?? '';
    }

    // skip children of SVGs because they have their own visibility rules
    if (node.tagName.toLocaleLowerCase() !== 'svg') {
      for (const child of node.childNodes) {
        const result = traverseDom(child, selector);
        // aggregate visible text
        visibleText += ' ' + result.visibleText;
        visibleText = visibleText.trim();
        // if parent doesn't have it, set aria-label with the first one found
        if (ariaLabel.length === 0 && result.ariaLabel.length > 0) {
          ariaLabel = result.ariaLabel;
        }
      }
    }

    // cache attributes in DOM
    node.setAttribute(visibleTextAttributeName, visibleText);
    node.setAttribute(ariaLabelArributeName, ariaLabel);
    return { visibleText, ariaLabel };
  }
  return emptyDomAttrs;
}

// a large base z-index to start with
const baseZIndex = 10000;

function drawLabelsOnSelector(selector: string) {
  // wrapper element
  const wrapper = document.createElement('div');
  wrapper.classList.add('_label_overlay_wrapper');
  // Get all elements that match the selector
  const elements = document.querySelectorAll(selector);
  // record times a label is used so that we can add a number to the end of the label
  const labelCounts = new Map<string, number>();

  // Iterate over the elements
  elements.forEach((elem, index) => {
    // skip if the element is already touched
    // this is avoid cases where the selector matches nested elements, e.g. an input and its parent label
    if (isTouchedElement(elem)) return;
    // if the element is not visible, skip it
    if (!isVisible(elem, true)) return;

    const { visibleText, ariaLabel } = traverseDom(elem, selector);
    // if the element already has visible text, no need to add a label
    if (visibleText !== '') {
      return;
    }
    // use the aria-label if it exists, otherwise just use the tag+index
    let labelBase = '';
    if (ariaLabel.length > 0) {
      labelBase = ariaLabel;
    } else {
      // for tag A we use "button" for better readability
      const tagName =
        elem.tagName === 'A' ? 'button' : elem.tagName.toLowerCase();
      labelBase = `${tagName}#${index}`;
    }

    // increment the count for this label
    const count = labelCounts.get(labelBase) ?? 0;
    labelCounts.set(labelBase, count + 1);
    // if the label is used more than once, add a number to the end (start from 2)
    const labelSuffix = count > 0 ? `#${count + 1}` : '';

    const label = `${labelBase}${labelSuffix}`;
    // set attribute so it's easier to find the element with selector
    elem.setAttribute(labelAttributeName, label);

    const rect = elem.getBoundingClientRect();
    // Create a new <div>
    const overlayDiv = document.createElement('div');
    overlayDiv.classList.add('_label_overlay');
    // Set the overlay's styles to match the position and size of the element
    Object.assign(overlayDiv.style, {
      top: `${window.scrollY + rect.top}px`, // considering the scrolled amount
      left: `${window.scrollX + rect.left}px`, // considering the scrolled amount
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      zIndex: baseZIndex + index, // place the overlay above previous ones
    });

    overlayDiv.innerHTML = `<span>${label}</span>`; // add the index of the element as text

    // Add the overlay to the wrapper
    wrapper.appendChild(overlayDiv);
  });

  document.body.appendChild(wrapper);
}

const selectorForInteractiveElements =
  'a, button, details, input, label, option, select, textarea, ' +
  '[tabindex], [onclick], [onmouseover], [onmousedown], [onmouseup],' + // we don't include keyboard events yet
  '[role="button"], [role="link"], [role="textbox"]';

export default function drawLabels() {
  drawLabelsOnSelector(selectorForInteractiveElements);
}
