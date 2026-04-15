/**
 * In-process async mutex for serializing concurrent writes to the JSON store.
 *
 * Why in-process? The app is single-instance (npm run dev / next start).
 * This prevents simultaneous requests from interleaving reads and writes on
 * the same JSON file, which would corrupt it. For a multi-process deployment,
 * a file-system lock (e.g. proper-lockfile) would be needed instead.
 */

type Release = () => void;

class Mutex {
  private queue: Array<(release: Release) => void> = [];
  private locked = false;

  acquire(): Promise<Release> {
    return new Promise((resolve) => {
      const tryAcquire = (release: Release) => {
        if (!this.locked) {
          this.locked = true;
          resolve(release);
        } else {
          this.queue.push(tryAcquire);
        }
      };

      const release: Release = () => {
        const next = this.queue.shift();
        if (next) {
          next(release);
        } else {
          this.locked = false;
        }
      };

      tryAcquire(release);
    });
  }

  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }
}

export const fragmentStoreLock = new Mutex();
