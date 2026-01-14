'use client';

import { EmailVerification } from '@/components/front-office/ui/EmailVerification';
import { Sidebar } from '@/components/front-office/ui/Sidebar';

export default function HomePage() {
  return (
    <div className="flex h-screen">
      <Sidebar 
        currentStep={1}
        steps={[/* your steps */]}
        onAlreadyRegistered={() => {}}
      />
      <EmailVerification 
        onVerified={(email) => {}}
        onAlreadyRegistered={() => {}}
      />
    </div>
  );
}