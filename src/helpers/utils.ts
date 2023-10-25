export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truthyFilter<T>(value: T | null | undefined): value is T {
  return Boolean(value);
}

export async function waitFor(
  predicate: () => Promise<boolean>,
  interval: number,
  _maxChecks: number
): Promise<void> {
  // special case for 0 maxChecks (wait forever)
  const maxChecks = _maxChecks === 0 ? Infinity : _maxChecks;
  let checkCount = 0;
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      if (await predicate()) {
        clearInterval(intervalId);
        resolve();
      } else {
        checkCount++;
        if (checkCount >= maxChecks) {
          clearInterval(intervalId);
          reject('Timed out waiting for condition');
        }
      }
    }, interval);
  });
}

export async function waitTillStable(
  getSize: () => Promise<number>,
  interval: number,
  timeout: number
): Promise<void> {
  let lastSize = 0;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  return waitFor(
    async () => {
      const currentSize = await getSize();

      console.log('last: ', lastSize, ' <> curr: ', currentSize);

      if (lastSize != 0 && currentSize === lastSize) {
        countStableSizeIterations++;
      } else {
        countStableSizeIterations = 0; //reset the counter
      }

      if (countStableSizeIterations >= minStableSizeIterations) {
        console.log('Size stable! Assume fully rendered..');
        return true;
      }

      lastSize = currentSize;
      return false;
    },
    interval,
    timeout / interval
  );
}
