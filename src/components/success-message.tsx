"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function SuccessMessage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <div className="bg-green-100 p-6 rounded-full mb-6">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Submitted Successfully!</h2>
      <p className="text-gray-600 mb-4 max-w-md">
        Thank you for registering for DevFest. We've received your information and will be in touch soon.
      </p>
      <p className="text-gray-500 text-sm mb-8 max-w-md">
        Please don't fill the form again or on behalf of your friends using the same device.
      </p>
      <div className="mt-6">
        <Button asChild>
          <a href="https://devfest.gdglebanon.com/" target="_blank" rel="noopener noreferrer">
            Return to DevFest Lebanon
          </a>
        </Button>
      </div>
    </div>
  );
}
