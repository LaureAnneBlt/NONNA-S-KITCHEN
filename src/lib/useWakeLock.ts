import { useEffect } from "react";

export function useWakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let done = false;

    const request = () => {
      if (document.visibilityState !== "visible" || (lock && !lock.released))
        return;
      navigator.wakeLock
        .request("screen")
        .then((l) => {
          if (done) l.release();
          else lock = l;
        })
        .catch(() => {});
    };

    request();
    document.addEventListener("visibilitychange", request);
    return () => {
      done = true;
      document.removeEventListener("visibilitychange", request);
      lock?.release().catch(() => {});
    };
  }, []);
}
