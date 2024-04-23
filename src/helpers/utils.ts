export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truthyFilter<T>(value: T | null | undefined): value is T {
  return Boolean(value);
}

export async function waitFor(
  predicate: () => Promise<boolean>,
  interval: number,
  _maxChecks: number,
  rejectOnTimeout = true,
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
          if (rejectOnTimeout) {
            reject(new Error("Timed out waiting for condition"));
          } else {
            resolve();
          }
        }
      }
    }, interval);
  });
}

export async function waitTillStable(
  getSize: () => Promise<number>,
  interval: number,
  timeout: number,
  rejectOnTimeout = false, // default to assuming stable after timeout
): Promise<void> {
  let lastSize = 0;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  return waitFor(
    async () => {
      const currentSize = await getSize();

      console.log("last: ", lastSize, " <> curr: ", currentSize);

      if (lastSize != 0 && currentSize === lastSize) {
        countStableSizeIterations++;
      } else {
        countStableSizeIterations = 0; //reset the counter
      }

      if (countStableSizeIterations >= minStableSizeIterations) {
        console.log("Size stable! Assume fully rendered..");
        return true;
      }

      lastSize = currentSize;
      return false;
    },
    interval,
    timeout / interval,
    rejectOnTimeout,
  );
}

export function enumKeys<O extends object, K extends keyof O = keyof O>(
  obj: O,
): K[] {
  return Object.keys(obj) as K[];
}

export function enumValues<O extends object>(obj: O): O[keyof O][] {
  return enumKeys(obj).map((key) => obj[key]);
}
