import { FilePenLine } from "lucide-react";
import RegistrationForm from "@/components/registration-form";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
            <FilePenLine className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Anonymous Registration
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create your profile without sharing any personal information.
          </p>
        </div>
        <RegistrationForm />
      </div>
    </main>
  );
}
