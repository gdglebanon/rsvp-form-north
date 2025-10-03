"use client";

import RegistrationForm from "@/components/registration-form";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white p-4 md:p-6">
      <div className="w-full max-w-md">
        <RegistrationForm />
      </div>
    </main>
  );
}
