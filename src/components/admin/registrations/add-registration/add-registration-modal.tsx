// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Progress } from "@/components/ui/progress";

// import EmailStep from "./steps/email-entry";
// import OtpStep from "./steps/otp";
// import ProfileStep from "./steps/personal-info";
// import AttendanceStep from "./steps/attendee-type";
// import { CircularStepProgress } from "../../ui/circular-progress-bar";

// type Step = 1 | 2 | 3 | 4 | 5;

// const TOTAL_STEPS = 5;

// function AddRegistrationModal({
//   open,
//   onClose,
// }: {
//   open: boolean;
//   onClose: () => void;
// }) {
//   const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="!max-w-3xl h-[90vh] flex flex-col pt-20">
//         <DialogHeader>
//           <div className="flex items-center justify-between">
//             <DialogTitle className="text-left mb-8 text-4xl font-bold">
//               Create New Registration
//             </DialogTitle>

//             <CircularStepProgress
//               current={step}
//               total={5}
//               size={75}
//               strokeWidth={3}
//               className="font-heading text-2xl"
//             />
//             {/* //{" "}
//             <div className="flex items-center justify-center rounded-full border w-10 h-10 text-sm font-medium">
//               // {step}/5 //{" "}
//             </div> */}
//           </div>
//         </DialogHeader>

//         {/* <Progress value={(step / 5) * 100} className="h-1 mb-4" /> */}

//         <div className="flex-1 overflow-y-auto">
//           {step === 1 && <EmailStep onNext={() => setStep(2)} />}
//           {step === 2 && (
//             <OtpStep
//               email="a***@gmail.com"
//               onNext={() => setStep(3)}
//               onBack={() => setStep(1)}
//             />
//           )}
//           {step === 3 && <ProfileStep onNext={() => setStep(4)} />}
//           {step === 4 && <AttendanceStep onNext={() => setStep(5)} />}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export { AddRegistrationModal };

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventYear } from "@/app/api/event";
import { AddRegistrationForm } from "./add-registration-form";

// function AddRegistrationModal({
//   open,
//   onClose,
// }: {
//   open: boolean;
//   onClose: () => void;
// }) {
//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-3xl">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold">
//             Add Registration
//           </DialogTitle>
//         </DialogHeader>

//         <AddRegistrationForm onSuccess={onClose} />
//       </DialogContent>
//     </Dialog>
//   );
// }

// export { AddRegistrationModal };

function AddRegistrationModal({
  open,
  onClose,
  events,
}: {
  open: boolean;
  onClose: () => void;
  events: EventYear[];
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Add Registration
          </DialogTitle>
        </DialogHeader>

        <AddRegistrationForm events={events} onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}
export { AddRegistrationModal };
