import { Suspense } from "react";
import RegisterClient from "../(front-office)/page";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterClient />
    </Suspense>
  );
}
