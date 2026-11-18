"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EnchantedDesk } from "@/components/enchanted/EnchantedDesk";
import { SequentialAuthFolio } from "@/components/enchanted/SequentialAuthFolio";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSuccess = () => {
    router.push(callbackUrl);
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[85vh] px-2 sm:px-4">
      <SequentialAuthFolio
        initialMode="login"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <EnchantedDesk>
      <Suspense fallback={
        <div className="w-full flex items-center justify-center min-h-[80vh]">
          <p className="font-handwritten text-3xl text-[#E8D5AD]/80 italic animate-pulse">
            Unfolding the folio...
          </p>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </EnchantedDesk>
  );
}
