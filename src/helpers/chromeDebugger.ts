export async function isDebuggerAttached(tabId: number) {
  const targets = await chrome.debugger.getTargets();
  return targets.some((target) => target.tabId === tabId && target.attached);
}

export async function attachDebugger(tabId: number) {
  const isAttached = await isDebuggerAttached(tabId);
  if (isAttached) {
    return;
  }
  return new Promise<void>((resolve, reject) => {
    try {
      chrome.debugger.attach({ tabId }, '1.2', async () => {
        if (chrome.runtime.lastError) {
          console.error(
            'Failed to attach debugger:',
            chrome.runtime.lastError.message
          );
          reject(
            new Error(
              `Failed to attach debugger: ${chrome.runtime.lastError.message}`
            )
          );
        } else {
          console.log('attached to debugger');
          await chrome.debugger.sendCommand({ tabId }, 'DOM.enable');
          console.log('DOM enabled');
          await chrome.debugger.sendCommand({ tabId }, 'Runtime.enable');
          console.log('Runtime enabled');
          resolve();
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function detachDebugger(tabId: number) {
  const isAttached = await isDebuggerAttached(tabId);
  if (isAttached) {
    chrome.debugger.detach({ tabId: tabId });
  }
}
