// import { AdminOtpForm } from "@/components/admin/auth/otp-form";
// import Image from "next/image";
// import AdminFormImage from "@/assets/images/admin-form-image.png";

// export default function AdminOtpPage() {
//   return (
//     <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
//       {/* Left image panel */}
//       <div className="relative hidden lg:block">
//         <Image
//           src={AdminFormImage}
//           alt="Event worship scene"
//           fill
//           className="object-cover"
//           priority
//         />
//       </div>

//       {/* Right form panel */}
//       <div className="flex items-center justify-center px-6">
//         <div className="w-full max-w-md rounded-xl border-[0.5px] border-slate-300 bg-white px-10 py-12 shadow-card shadow-[#585C5F29]">
//           <div className="flex flex-col gap-3">
//             <h2 className="mb-2 text-2xl font-bold text-gray-900">
//               Verify OTP
//             </h2>
//             <p className="mb-6 text-sm text-gray-500">
//               Enter the 6-digit code sent to your email.
//             </p>
//           </div>

//           <AdminOtpForm />
//         </div>
//       </div>
//     </main>
//   );
// }

import { Suspense } from "react";
import Image from "next/image";

import { AdminOtpForm } from "@/components/admin/auth/otp-form";
import { AdminOtpSkeleton } from "@/components/admin/auth/otp-skeleton";
import AdminFormImage from "@/assets/images/admin-form-image.png";

function AdminOtpContent() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left image panel */}
      <div className="relative hidden lg:block">
        <Image
          src={AdminFormImage}
          alt="Event worship scene"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-xl border-[0.5px] border-slate-300 bg-white px-10 py-12 shadow-card shadow-[#585C5F29]">
          <div className="flex flex-col gap-3">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Verify OTP
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              Enter the 6-digit code sent to your email.
            </p>
          </div>

          <AdminOtpForm />
        </div>
      </div>
    </main>
  );
}

export default function AdminOtpPage() {
  return (
    <Suspense fallback={<AdminOtpSkeleton />}>
      <AdminOtpContent />
    </Suspense>
  );
}
