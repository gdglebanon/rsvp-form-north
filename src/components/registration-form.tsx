'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SuccessMessage } from "./success-message";
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
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { UniversityCombobox } from "./ui/university-combobox";
import Image from "next/image";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .refine(
      (email) => {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return emailRegex.test(email);
      },
      {
        message: "Please enter a valid email address (e.g., name@example.com)",
      }
    ),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  specialization: z.string().min(1, "Specialization is required."),
  experience: z.string().array().min(1, "Please select at least one option"),
  company: z.string().min(1, "Company or university is required."),
  region: z.string().min(1, "Region is required."),
  age_range: z.string().optional(),
  gender: z.string().optional(),
  linkedin: z.string().optional(),
  phone: z.string().optional()
    .refine((val) => {
      if (!val) return true;
      const num = val.replace(/[\s-]/g, '').replace(/^\+?961?/, '');
      // For 03 numbers: 03 123 456 (8 digits total)
      if (num.startsWith('03')) {
        return /^03\d{6}$/.test(num);
      }
      // For mobile numbers: 7X XXX XXX (7 digits total, starts with 7 or 8 or 9)
      return /^[7-9]\d{7}$/.test(num);
    }, {
      message: "Please enter a valid Lebanese phone number (e.g., 71 234 567 or 03 123 456)",
    }),
  attended_before: z.string().min(1, "This field is required."),
  main_takeaways: z.array(z.string()).optional(),
  how_did_you_hear: z.string().min(1, "This field is required."),
  how_did_you_hear_details: z.string().optional(),
  personal_project: z.string().optional(),
  interested_technologies: z.array(z.string()).optional(),
  additional_comments: z.string().optional(),
});

type FormData = {
  email: string;
  first_name: string;
  last_name: string;
  specialization: string;
  experience: string[];
  company: string;
  region: string;
  age_range?: string;
  gender?: string;
  linkedin?: string;
  phone?: string;
  attended_before: string;
  main_takeaways?: string[];
  how_did_you_hear: string;
  how_did_you_hear_details?: string;
  personal_project?: string;
  interested_technologies?: string[];
  additional_comments?: string;
};

const techOptions = [
    { label: "Angular", value: "angular" },
    { label: "Node.js", value: "nodejs" },
    { label: "Golang", value: "golang" },
    { label: "Firebase", value: "firebase" },
    { label: "Web Technologies", value: "web_technologies" },
    { label: "Backend Development", value: "backend_development" },
    { label: "Front End Development", value: "frontend_development" },
    { label: "Cloud", value: "cloud" },
    { label: "Kubernetes", value: "kubernetes" },
    { label: "Microservices", value: "microservices" },
    { label: "Database", value: "database" },
    { label: "Android", value: "android" },
    { label: "Flutter", value: "flutter" },
    { label: "Machine learning", value: "machine_learning" },
    { label: "Tensorflow", value: "tensorflow" },
    { label: "Gemini / ChatGPT", value: "gemini_chatgpt" },
    { label: "Cybersecurity", value: "cybersecurity" },
    { label: "Web3 / Blockchain", value: "web3_blockchain" },
    { label: "Other", value: "other" },
];

const takeawayOptions = [
    { label: "Networking", value: "networking" },
    { label: "Job Opportunites", value: "job_opportunities" },
    { label: "Participating in Vibathon competiton", value: "vibathon" },
    { label: "Talk to mentors / CV review", value: "mentors_cv" },
    { label: "Attending Practical Workshop", value: "workshop" },
    { label: "Learning new technologies", value: "new_technologies" },
];

export default function RegistrationForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      specialization: "",
      experience: [],
      company: "",
      region: "",
      age_range: "",
      gender: "",
      how_did_you_hear_details: "",
      attended_before: "",
      how_did_you_hear: "",
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

    setIsSubmitting(true);
    try {
      const profileRef = doc(firestore, "profiles", user.uid);
      
      // Filter out null, undefined, and empty string/array values before saving
      const dataToSave: Partial<FormData> = {};
      for (const key in values) {
          const typedKey = key as keyof FormData;
          const value = values[typedKey];

          if (value === null || value === undefined) {
              continue;
          }
          
          // Skip empty strings and empty arrays
          if (typeof value === 'string' && value.trim() === '') {
              continue;
          }
          
          if (Array.isArray(value) && value.length === 0) {
              continue;
          }

          dataToSave[typedKey] = value as any;
      }

      // Only save non-empty fields
      await setDoc(profileRef, {
        ...dataToSave,
        userId: user.uid,
        // Use the form's email if available, otherwise fall back to the authenticated user's email
        email: values.email || user.email || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Show success state
      setIsSubmitted(true);
      
      // Scroll to top of page
      window.scrollTo(0, 0);
      
      // Reset form
      form.reset();
      
    } catch (error) {
      console.error("Error saving profile: ", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error saving your profile. Please try again.",
        variant: "destructive",
      });
      return;
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
            <svg
              className="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Thank you for your interest.</h2>
          <div className="text-left space-y-4 text-muted-foreground max-w-lg">
            <p>We will get back to you in 5 working days following up your registration if you're selected or you will be on waitlist list.</p>
            
            <p>If you are selected you will receive an email that a spot opened for you have limited time to redeem your ticket on our platform.</p>
            
            <p>If you're not a member in our community please join <a 
              href="https://gdg.community.dev/gdg-coast-lebanon/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GDG Coast Lebanon
            </a></p>
            
            <p>You can also follow DevFest updates on Instagram 
              <a 
                href="https://www.instagram.com/gdgcoastlebanon/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                @gdgcoastlebanon
              </a>{' '}
              <a 
                href="https://www.instagram.com/devfestlebanon/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @devfestlebanon
              </a>
            </p>
          </div>
          <div className="pt-6">
            <Button 
              onClick={() => window.location.href = 'https://devfest.gdglebanon.com'}
              className="px-6"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex flex-col items-center justify-center mb-8 space-y-2">
        <Image 
          src="/images/devfest-logo.svg" 
          alt="DevFest Logo" 
          width={200} 
          height={80}
          priority
          className="h-auto"
        />
        <p className="text-lg font-medium text-muted-foreground">2 mins Registration Form</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="your.email@example.com" 
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Specialization *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the most relevant for you" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ai_engineer">AI Engineer / Researcher</SelectItem>
                  <SelectItem value="full_stack">Full Stack Software Engineer</SelectItem>
                  <SelectItem value="data_scientist">Data Scientist / Data Engineer</SelectItem>
                  <SelectItem value="cloud_architect">Cloud Architect / DevOps Engineer</SelectItem>
                  <SelectItem value="backend_developer">Backend Developer (Node.js, Go, Python..)</SelectItem>
                  <SelectItem value="frontend_developer">Frontend Developer (React, Vue, Angular)</SelectItem>
                  <SelectItem value="mobile_developer">Mobile Developer (Android, iOS, Flutter)</SelectItem>
                  <SelectItem value="product_manager">Project / Product Manager</SelectItem>
                  <SelectItem value="other_tech">Other in tech</SelectItem>
                  <SelectItem value="other_non_tech">Other non-tech</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel> Experience / Study *</FormLabel>
              <MultiSelect
                options={[
                  { label: "< 1 year experience", value: "0-1" },
                  { label: "1-2 years experience", value: "1-2" },
                  { label: "3-5 years experience", value: "3-5" },
                  { label: "5+ years experience", value: "5-7" },
                  { label: "CTO / CEO / Executive", value: "cto_ceo" },
                  { label: "Manager / Team Lead", value: "manager_teamlead" },
                  { label: "Intern", value: "intern" },
                  { label: "Bootcamp Attendee", value: "bootcamp" },
                  { label: "University Student", value: "student" },
                  { label: "1st or 2nd Year Student", value: "grad_student" },
                  { label: "3rd Year Student", value: "phd_student" },
                  { label: "Master Student", value: "post_grad_student" },
                ]}
                className="w-full"
                onValueChange={(value) => {
                  setSelectedExperience(value);
                  field.onChange(value);
                }}
                defaultValue={field.value || []}
                value={selectedExperience}
                placeholder="Select all that apply to you"
                variant="inverted"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your current company / university *</FormLabel>
              <FormControl>
                <UniversityCombobox 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Please select your region (or nearest) *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your region" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="beirut">Beirut</SelectItem>
                            <SelectItem value="metn_baabda">Metn / Baabda</SelectItem>
                            <SelectItem value="jbeil_keserwen">Jbeil / Keserwen</SelectItem>
                            <SelectItem value="aley_chouf">Aley / Chouf</SelectItem>
                            <SelectItem value="akkar_north">Akkar / North</SelectItem>
                            <SelectItem value="south_nabatiyi">South / Nabatiyi</SelectItem>
                            <SelectItem value="beqaa_hermel">Beqaa / Hermel</SelectItem>
                            <SelectItem value="outside_lebanon">Outside Lebanon</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="age_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age Range (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="18-23">18 - 23 years</SelectItem>
                    <SelectItem value="24-30">24 - 30 years</SelectItem>
                    <SelectItem value="30+">30+ years</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Profile Link (Optional)</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  value={field.value || ''}
                  placeholder="https://www.linkedin.com/in/your-profile"
                />
              </FormControl>
              <FormDescription>
                Or write details about you, for example: I use Go for production, am learning Flutter, I'm Frontend dev, Senior Software Engineer..
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number (Optional)</FormLabel>
              <div className="space-y-1">
                {field.value && field.value.replace(/^\+?961/, '').length > 0 && !/^\+961(03\d{6}|[7-9]\d{7})$/.test(field.value) && (
                  <p className="text-sm text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-md shadow-sm">
                    Please enter a valid Lebanese number (e.g., 71 234 567 or 03 123 456)
                  </p>
                )}
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="71 234 567" 
                    value={field.value ? field.value.replace(/^\+?961/, '') : ''}
                    className={cn(
                      'pl-12 transition-colors',
                      field.value && !/^\+961(03\d{6}|[7-9]\d{7})$/.test(field.value) 
                        ? 'border-yellow-500 focus-visible:ring-yellow-500' 
                        : ''
                    )}
                    onChange={(e) => {
                      // Remove all non-digit characters and any leading 961
                      let value = e.target.value.replace(/\D/g, '').replace(/^961/, '');
                      
                      // If user types '3' at the start, convert to '03' for landline
                      if (value === '3' || (value.startsWith('3') && value.length > 1 && value[1] !== '0')) {
                        value = '0' + value;
                      }
                      
                      // Enforce max length based on number type
                      const isLandline = value.startsWith('03');
                      const maxDigits = isLandline ? 8 : 8; // 03 123 456 (8) or 7X XXX XXX (8)
                      value = value.slice(0, maxDigits);
                      
                      // Format the number with spaces
                      if (value.length > 0) {
                        if (isLandline) {
                          // Format as 03 123 456 (8 digits total)
                          value = value.replace(/^(03)?(\d{0,2})(\d{0,3})$/, (_, p1, p2, p3) => {
                            let result = '03';
                            if (p2) result += ' ' + p2;
                            if (p3) result += ' ' + p3;
                            return result.trim();
                          });
                        } else {
                          // Format as XX XXX XXX for mobile numbers (8 digits total)
                          value = value.replace(/^(\d{0,2})(\d{0,3})(\d{0,3})$/, (_, p1, p2, p3) => {
                            let result = '';
                            if (p1) result += p1;
                            if (p2) result += ' ' + p2;
                            if (p3) result += ' ' + p3;
                            return result.trim();
                          });
                        }
                      }
                      
                      // Store the value with +961 prefix for validation
                      const fullNumber = value ? `+961${value.replace(/\s/g, '')}` : '';
                      field.onChange(fullNumber);
                    }}
                    inputMode="tel"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    +961
                  </span>
                </div>
              </FormControl>
              </div>
              <FormDescription>
                Will be used for follow up in case we can't reach you via email
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="attended_before"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Have you attended DevFest before? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="yes_once">Yes once</SelectItem>
                            <SelectItem value="never_invited">Never got invited</SelectItem>
                            <SelectItem value="invited_not_attended">Got invited before but didn't attend</SelectItem>
                            <SelectItem value="attended_gdg">I attended some GDG events</SelectItem>
                            <SelectItem value="first_time">First time to hear about GDG / DevFest</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="main_takeaways"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>What are your main takeaways from DevFest? *</FormLabel>
                        <FormControl>
                            <MultiSelect
                                options={takeawayOptions}
                                onValueChange={field.onChange}
                                defaultValue={field.value ?? []}
                                placeholder="Select your main takeaways"
                            />
                        </FormControl>
                    <FormDescription>
                        We are organizing 90 minutes vibecoding mini hackathon with external AI API, 2 hours practical workshop. First come First serve registration in early morning with limit of 1 workshop per attendee.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="how_did_you_hear"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>How did you hear about DevFest? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="social_media">Social Media (Instagram, Facebook, LinkedIn)</SelectItem>
                            <SelectItem value="university">University / College</SelectItem>
                            <SelectItem value="friends">Friends / Colleagues</SelectItem>
                            <SelectItem value="gdg_website">GDG Lebanon website / newsletter</SelectItem>
                            <SelectItem value="other_events">Other community events</SelectItem>
                            <SelectItem value="partner">Via a partner</SelectItem>
                            <SelectItem value="other">Other (please specify)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    {(form.watch('how_did_you_hear') === 'partner' || form.watch('how_did_you_hear') === 'other') && (
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="how_did_you_hear_details"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {form.watch('how_did_you_hear') === 'partner' 
                                  ? 'Partner Name *' 
                                  : 'Please specify here'}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={
                                    form.watch('how_did_you_hear') === 'partner'
                                      ? 'Please specify the partner name'
                                      : 'Please provide more details about how you heard about DevFest'
                                  }
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="personal_project"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you have any personal project or something public you would like to present for the community? (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="we are studying dedicating 5 mins demo and maybe a People choice award"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interested_technologies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please select the technologies you are interested in (Optional)</FormLabel>
              <FormControl>
                <MultiSelect
                  options={techOptions}
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? []}
                  placeholder="Select technologies"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="additional_comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Comments or Suggestions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Feel free to provide any comments, suggestions, the most topics you're interested"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Create Profile
        </Button>
      </form>
    </Form>
  </div>
  );
}
