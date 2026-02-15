"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Global error:", error);

  return (
    <html>
      <body style={{ padding: 16 }}>
        <h2>App crashed.</h2>
        <p>Digest: {error.digest}</p>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
