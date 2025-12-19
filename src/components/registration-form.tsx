'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { UniversityCombobox } from "@/components/ui/university-combobox";
import Image from "next/image";

const baseSchema = z.object({
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
  company: z.string().min(1, "Company or university is required."),
  education: z.string().optional(),
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
  linkedin: z.string().optional(),
});

const defaultSchema = baseSchema.extend({
  experience: z.string().array().min(1, "Please select at least one option"),
  region: z.string().min(1, "Region is required."),
  age_range: z.string().optional(),
  gender: z.string().optional(),
  attended_before: z.string().min(1, "This field is required."),
  main_takeaways: z.array(z.string()).default([]),
  reference: z.string().min(1, "This field is required."),
  referenceDetails: z.string().optional(),
  interested_technologies: z.array(z.string()).optional(),
  additional_comments: z.string().optional(),
  secret_code: z.string().min(1, "Secret code is required").refine(val => {
    // Check if code contains RSVP (always valid)
    if (val.includes("RSVP")) return true;

    // Check if code contains BAU and if it's still valid (expires Dec 19, 2025 at 2pm Beirut time GMT+2)
    if (val.includes("BAU")) {
      const now = new Date();
      const expiryDate = new Date('2025-12-19T14:00:00+02:00'); // 2pm Beirut time (GMT+2)
      return now < expiryDate;
    }

    return false;
  }, {
    message: "Invalid secret code. Registration is closed.",
  }),
});

const partnerSchema = baseSchema.extend({
  // Partner mode makes these optional/ignored
  experience: z.string().array().optional(),
  region: z.string().optional(),
  age_range: z.string().optional(),
  gender: z.string().optional(),
  attended_before: z.string().optional(),
  main_takeaways: z.array(z.string()).default([]),
  reference: z.string().optional(),
  referenceDetails: z.string().optional(),
  interested_technologies: z.array(z.string()).optional(),
  additional_comments: z.string().optional(),
  secret_code: z.string().optional(),
});

type FormData = z.infer<typeof defaultSchema> & z.infer<typeof partnerSchema>;

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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationFormContent />
    </Suspense>
  );
}

function RegistrationFormContent() {
  // Removed useAuth as we don't need user from Firebase
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPartner = searchParams.has("partner");
  const isSpeaker = searchParams.has("speaker");
  const isVolunteer = searchParams.has("volunteer");
  const isSpecialMode = isPartner || isSpeaker || isVolunteer;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [isUniversitySelected, setIsUniversitySelected] = useState(false);
  const [isCustomCompany, setIsCustomCompany] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(isSpecialMode ? partnerSchema : defaultSchema),
    defaultValues: {
      secret_code: "",
      email: "",
      first_name: "",
      last_name: "",
      specialization: "",
      experience: [],
      company: "",
      region: "",
      age_range: "",
      gender: "",
      linkedin: "",
      phone: "",
      attended_before: "",
      main_takeaways: [],
      reference: "",
      referenceDetails: "",
      interested_technologies: [],
      additional_comments: ""
    },
  });

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);

    const isModalComment = () => {
      if (isPartner) return "PARTNER_EXTERNAL";
      if (isSpeaker) return "SPEAKER_EXTERNAL";
      if (isVolunteer) return "VOLUNTEER_EXTERNAL";
      return values.additional_comments;
    };

    // Map form data to match expected API field names
    const dataToSave: Record<string, string> = {};

    // Prepare the data to be sent
    const fields = {
      firstName: values.first_name,
      lastName: values.last_name,
      email: values.email,
      specialization: values.specialization,
      experience: values.experience?.join(', '),
      company: values.company,
      education: values.education,
      region: values.region,
      age: values.age_range,
      gender: values.gender,
      linkedin: values.linkedin,
      phone: values.phone,
      attendedBefore: values.attended_before,
      interestedIn: values.interested_technologies?.join(', '),
      comments: isModalComment(),
      reference: values.reference,
      mainTakeways: values.main_takeaways?.join(', '),
      // Only include referenceDetails if reference is 'partner' or 'other'
      ...((values.reference === 'partner' || values.reference === 'other') && {
        referenceDetails: values.referenceDetails || ''
      })
    };

    // Convert all values to strings and filter out empty values
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        dataToSave[key] = String(value);
      }
    });

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbwFxw5-r3B8QA6Sm4E2APNA1PAc0GW8m_LZWJZxvzdlUlRr5vbnIiDCfevXIV33bSfeXQ/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(dataToSave),
        // Remove no-cors to be able to read the response
      });

      // Try to parse the response as JSON
      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      if (result.status === true) {
        // Show success state
        setIsSubmitted(true);
        // Scroll to top of page
        window.scrollTo(0, 0);
        // Reset form
        form.reset();
      } else {
        throw new Error(result.error || 'Failed to submit registration');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
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
              GDG North, Lebanon
            </a></p>

            <p>You can also follow DevFest updates on Instagram
              <a
                href="https://www.instagram.com/gdgcoastlebanon/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                @gdgnorthlebanon
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
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col items-center justify-center mb-4 space-y-1">
        <Image
          src="/images/devfest-logo.svg"
          alt="DevFest Logo"
          width={180}
          height={72}
          priority
          className="h-auto"
        />
        <p className="text-base font-medium text-muted-foreground">Registration Form [2 mins ]</p>
      </div>

      <div className="mb-4 p-4 bg-muted/30 rounded-lg space-y-2 text-sm">
        <p>DevFest North is coming! Join us on <strong>December 20th</strong> at <strong>Beirut Arab University, Tripoli Campus</strong> for a full-day conference packed with inspiring talks, hands-on workshops, thought-provoking panels, and stories that spark innovation.</p>
        <p>This year's lineup features <strong>20+ speakers</strong> from leading local and international organizations, including <strong>Google Developer Experts, and many more</strong>.</p>
        <p>A big thank you goes out to our amazing sponsors and partners for making this possible. Stay tuned, the full agenda <a href="https://north25.gdglebanon.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">north25.gdglebanon.com</a></p>
      </div>

      {!isSpecialMode && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg space-y-1 text-xs border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm">⚠️ Registration Closed</h3>
          <p className="text-yellow-700 dark:text-yellow-300">Registration is closed, but you can still attend on Saturday! Please note that a lunch meal might not be guaranteed for last minute attendees.</p>
          <p className="text-yellow-700 dark:text-yellow-300">Enter the secret code below to submit your registration.</p>
        </div>
      )}

      {isSpecialMode && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-1 text-xs border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">ℹ️ Networking Tip</h3>
          <p className="text-blue-700 dark:text-blue-300">We recommend filling all the fields for easier networking, as we will use this info to print your QR code badge.</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {!isSpecialMode && (
            <FormField
              control={form.control}
              name="secret_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Code *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter secret code"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Only valid codes will enable submission 
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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
                  inputMode="none"
                  options={[
                    { label: "< 1 year experience", value: "0-1" },
                    { label: "1-2 years experience", value: "1-2" },
                    { label: "3-5 years experience", value: "3-5" },
                    { label: "5+ years experience", value: "5-7" },
                    { label: "Freelancer", value: "freelancer" },
                    { label: "CTO / CEO / Executive", value: "cto_ceo" },
                    { label: "Manager / Team Lead", value: "manager_teamlead" },
                    { label: "Intern", value: "intern" },
                    { label: "Bootcamp Attendee", value: "bootcamp" },
                    { label: "University Student", value: "student" },
                    { label: "1st or 2nd Year Student", value: "undergrad_student" },
                    { label: "3rd Year Student", value: "post_grad" },
                    { label: "Master Student / PHD", value: "grad_student" },
                    { label: "Fresh Graduate", value: "fresh_grad" },
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
                  <div className="space-y-2">
                    <UniversityCombobox
                      value={field.value}
                      onChange={(value: string, isCustom?: boolean) => {
                        field.onChange(value);
                        // Check if a university is selected (value is not empty) and not a custom entry
                        const isUniSelected = !!value && !isCustom;
                        setIsUniversitySelected(isUniSelected);
                        setIsCustomCompany(!!isCustom);
                        // Clear education field when not a university
                        if (!isUniSelected) {
                          form.setValue('education', '');
                        }
                      }}
                    />
                  </div>
                </FormControl>
                {isUniversitySelected && !isCustomCompany && (
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Major / Field of Study *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Computer Science, Engineering, Business Administration"
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
          {!isSpecialMode && (
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
                      <SelectItem value="north">North</SelectItem>
                      <SelectItem value="akkar">Akkar</SelectItem>
                      <SelectItem value="south_nabatiyi">South / Nabatiyi</SelectItem>
                      <SelectItem value="beqaa_hermel">Beqaa / Hermel</SelectItem>
                      <SelectItem value="outside_lebanon">Outside Lebanon</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {!isSpecialMode && (
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
          )}
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
          {!isSpecialMode && (
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
          )}

          {!isSpecialMode && (
            <>
              <FormField
                control={form.control}
                name="main_takeaways"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are your main takeaways from DevFest? *</FormLabel>
                    <FormControl>
                      <MultiSelect
                        inputMode="none"
                        options={[
                          { label: 'Learning new technologies', value: 'learned_new_tech' },
                          { label: 'Networking opportunities', value: 'networking' },
                          { label: 'Hands-on workshops', value: 'workshops' },
                          { label: 'Inspiring speakers', value: 'speakers' },
                          { label: 'Community building', value: 'community' },
                          { label: 'Career development', value: 'career' },
                          { label: 'Join the Open Source Challenge', value: 'challenge' },
                          { label: 'Other', value: 'other' }
                        ]}
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? []}
                        placeholder="Select your main takeaways"
                      />
                    </FormControl>
                    <FormDescription>
                      Select all that apply. Your feedback helps us improve future events.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference"
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
                    {(() => {
                      const referenceValue = form.watch('reference');
                      const showDetails = referenceValue === 'partner' || referenceValue === 'other';

                      if (!showDetails) return null;

                      return (
                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name="referenceDetails"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {referenceValue === 'partner'
                                    ? 'Partner Name *'
                                    : 'Please specify here'}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={
                                      referenceValue === 'partner'
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
                      );
                    })()}
                  </FormItem>
                )}
              />

            </>
          )}

          <FormField
            control={form.control}
            name="interested_technologies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Please select the technologies you are interested in (Optional)</FormLabel>
                <FormControl>
                  <MultiSelect
                    inputMode="none"
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
          {!isSpecialMode && (
            <FormField
              control={form.control}
              name="additional_comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments or Suggestions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Feel free to provide any comments, suggestions, or topics you're interested in. Also, let us know if you have any personal projects you'd like to present to the community (we're considering 5-minute demos with a People's Choice Award)."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting || (!isSpecialMode && (() => {
            const code = form.watch('secret_code');
            if (!code) return true;

            // Check if code contains RSVP (always valid)
            if (code.includes('RSVP')) return false;

            // Check if code contains BAU and if it's still valid
            if (code.includes('BAU')) {
              const now = new Date();
              const expiryDate = new Date('2025-12-19T14:00:00+02:00'); // 2pm Beirut time (GMT+2)
              return now >= expiryDate; // disabled if expired
            }

            return true; // disabled if no valid code
          })())}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
