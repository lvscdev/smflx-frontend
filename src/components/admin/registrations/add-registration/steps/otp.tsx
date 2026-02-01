import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import MessageImg from "@/assets/images/message.png";
import { Label } from "@/components/ui/label";

function OtpStep({
  email,
  onNext,
  onBack,
}: {
  email: string;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6 h-full flex flex-col justify-between">
      <div className="w-full flex flex-col items-center space-y-4">
        <Image
          src={MessageImg}
          alt=""
          width={100}
          height={100}
          className="w-fit"
        />

        <div className="text-center w-[60%] space-y-4 mb-5">
          <h4 className="text-2xl font-bold">Check Your Inbox</h4>
          <p className="text-sm text-slate-500 text-left">
            We’ve sent a one-time password to <b>{email}</b> Enter the code to
            verify and proceed
          </p>
        </div>
        <div className="flex gap-2 items-center w-full">
          <div className="w-full">
            <Label className="mb-2">OTP</Label>
            <Input placeholder="Enter OTP" />
          </div>
          <Button variant="outline" className="self-end">
            Resend OTP
          </Button>
        </div>
      </div>

      <Button
        className="w-full bg-brand-red self-end hover:bg-brand-red/80"
        onClick={onNext}
      >
        Save Profile & Proceed
      </Button>
    </div>
  );
}

export default OtpStep;
