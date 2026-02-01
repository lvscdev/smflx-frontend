// "use client";

// import { useEffect, useState } from "react";

// export function useCountdown(seconds: number) {
//   const [remaining, setRemaining] = useState(seconds);

//   useEffect(() => {
//     if (remaining <= 0) return;

//     const interval = setInterval(() => {
//       setRemaining(s => s - 1);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [remaining]);

//   return {
//     remaining,
//     expired: remaining <= 0,
//   };
// }

"use client";

import { useEffect, useState } from "react";

export function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining(s => s - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining]);

  function reset() {
    setRemaining(initialSeconds);
  }

  return {
    remaining,
    expired: remaining <= 0,
    reset, // ✅ expose reset
  };
}
