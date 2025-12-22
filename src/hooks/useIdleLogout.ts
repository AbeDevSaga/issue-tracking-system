import { useEffect, useRef } from "react";

const IDLE_TIMEOUT = 5 * 60 * 1000; // 2 minutes

export const useIdleLogout = (isActive: boolean | null) => {
  const timerRef = useRef<number | null>(null);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.replace("/login");
  };

  const resetTimer = () => {
    if (!isActive) return;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(logout, IDLE_TIMEOUT);
  };

  useEffect(() => {
    if (!isActive) return;

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    resetTimer();

    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [isActive]);
};
