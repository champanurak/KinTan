import { Suspense } from "react";
import StoreCartPage from "@/features/store-cart/store-cart-page";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-gray-400">กำลังโหลด...</p>
        </div>
      }
    >
      <StoreCartPage />
    </Suspense>
  );
}
