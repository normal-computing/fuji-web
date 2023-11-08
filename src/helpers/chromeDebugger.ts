// Not sure why but this won't work properly if running inside a devtools panel
// a lot of tabs are shown as attached to debugger when they are not
// export async function isDebuggerAttached(tabId: number) {
//   const targets = await chrome.debugger.getTargets();
//   console.log(targets);
//   return targets.some((target) => target.tabId === tabId && target.attached);
// }

export async function attachDebugger(tabId: number) {
  console.log('start attachDebugger');
  // const isAttached = await isDebuggerAttached(tabId);
  // if (isAttached) {
  //   console.log('already attached to debugger', tabId);
  //   return;
  // }
  return new Promise<void>((resolve, reject) => {
    return chrome.debugger.attach({ tabId }, '1.3', async () => {
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
  });
}

export async function detachDebugger(tabId: number) {
  // const isAttached = await isDebuggerAttached(tabId);
  // if (isAttached) {
  chrome.debugger.detach({ tabId: tabId });
  // }
}
