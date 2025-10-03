"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters.").max(50, "Username must be at most 50 characters."),
  bio: z.string().max(160, "Bio must be at most 160 characters.").optional(),
  interests: z.string().max(100, "Interests must be at most 100 characters.").optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function RegistrationForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      bio: "",
      interests: "",
    },
  });

  async function onSubmit(values: FormData) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to create a profile.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const profileRef = doc(firestore, "profiles", user.uid);
        await setDoc(profileRef, {
          ...values,
          createdAt: new Date(),
        });

        toast({
          title: "Profile Created!",
          description: "Your anonymous profile has been saved successfully.",
        });
        
        form.reset();
        
      } catch (error) {
        console.error("Error saving profile: ", error);
        toast({
          title: "Error",
          description: "There was an error saving your profile. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="e.g. creative_cat" {...field} />
              </FormControl>
              <FormDescription>
                This is your public anonymous display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
               <FormDescription>
                A short bio to appear on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interests</FormLabel>
              <FormControl>
                <Input placeholder="e.g. art, coding, music" {...field} />
              </FormControl>
              <FormDescription>
                List some interests, separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Create Profile
        </Button>
      </form>
    </Form>
  );
}
