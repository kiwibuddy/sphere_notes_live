export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Reject if `promise` does not settle within `ms`. */
export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  label: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(`${label} (${Math.round(ms / 1000)}s)`));
    }, ms);

    Promise.resolve(promise)
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err: unknown) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/** Retry a slow Supabase call (e.g. project waking from pause). */
export async function withRetry<T>(
  fn: () => PromiseLike<T>,
  options: {
    attempts?: number;
    delayMs?: number;
    timeoutMs: number;
    label: string;
  }
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const delayMs = options.delayMs ?? 1_500;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await withTimeout(fn(), options.timeoutMs, options.label);
    } catch (err) {
      lastError = err;
      if (attempt < attempts - 1) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}

export const SUPABASE_WAKE_HINT =
  "If this keeps happening, open supabase.com → your project → Settings and confirm the project is not paused, then tap Retry.";
