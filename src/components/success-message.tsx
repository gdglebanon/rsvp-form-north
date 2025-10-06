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
      <div className="bg-blue-50 p-4 rounded-lg mb-6 max-w-md text-left">
        <h3 className="font-medium text-blue-800 mb-2">Important Next Steps</h3>
        <p className="text-blue-700 text-sm">
          You should have received an email to <strong>verify your email address</strong>. Please check your inbox (and spam folder) and click the verification link to ensure we can review your application.
        </p>
      </div>
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
