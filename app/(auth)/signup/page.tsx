"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { EnchantedDesk } from "@/components/enchanted/EnchantedDesk";
import { SequentialAuthFolio } from "@/components/enchanted/SequentialAuthFolio";

function SignupContent() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/");
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[85vh] px-2 sm:px-4">
      <SequentialAuthFolio
        initialMode="signup"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default function SignupPage() {
  return (
    <EnchantedDesk>
      <Suspense fallback={
        <div className="w-full flex items-center justify-center min-h-[80vh]">
          <p className="font-handwritten text-3xl text-[#E8D5AD]/80 italic animate-pulse">
            Inscribing a fresh page...
          </p>
        </div>
      }>
        <SignupContent />
      </Suspense>
    </EnchantedDesk>
  );
}
