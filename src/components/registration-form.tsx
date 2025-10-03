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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  specialization: z.string().min(1, "Specialization is required."),
  experience: z.string().min(1, "Years of experience is required."),
  company: z.string().min(1, "Company or university is required."),
  region: z.string().min(1, "Region is required."),
  age_gender: z.string().optional(),
  linkedin: z.string().optional(),
  phone: z.string().optional(),
  attended_before: z.string().min(1, "This field is required."),
  main_takeaways: z.array(z.string()).optional(),
  how_did_you_hear: z.string().min(1, "This field is required."),
  personal_project: z.string().optional(),
  interested_technologies: z.array(z.string()).optional(),
  additional_comments: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

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
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      specialization: "",
      experience: "",
      company: "",
      region: "",
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

    startTransition(async () => {
      try {
        const profileRef = doc(firestore, "profiles", user.uid);
        
        // Filter out undefined values
        const dataToSave: Partial<FormData> = {};
        for (const key in values) {
          if (values[key as keyof FormData] !== undefined) {
            dataToSave[key as keyof FormData] = values[key as keyof FormData];
          }
        }

        await setDoc(profileRef, {
          ...dataToSave,
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="First Name, Last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
              <FormLabel>Years of Experience *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your years of experience" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="1-2">1-2 Years</SelectItem>
                        <SelectItem value="3+">3+ Years</SelectItem>
                        <SelectItem value="5+">5+ Years</SelectItem>
                        <SelectItem value="fresh_grad">Fresh Grad / 3rd Year / Master</SelectItem>
                        <SelectItem value="bootcamp">Bootcamp Attendee / Intern</SelectItem>
                        <SelectItem value="team_lead">Team Lead / CTO / CEO</SelectItem>
                        <SelectItem value="student">University Student</SelectItem>
                    </SelectContent>
                </Select>
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
                <Input {...field} />
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
        <FormField
            control={form.control}
            name="age_gender"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Age / Gender</FormLabel>
                    <FormControl>
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                        >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="18-23_male" />
                                </FormControl>
                                <FormLabel className="font-normal">18-23 Male</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="18-23_female" />
                                </FormControl>
                                <FormLabel className="font-normal">18-23 Female</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="24-30_male" />
                                </FormControl>
                                <FormLabel className="font-normal">24-30 Male</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="24-30_female" />
                                </FormControl>
                                <FormLabel className="font-normal">24-30 Female</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="30+_male" />
                                </FormControl>
                                <FormLabel className="font-normal">30+ Male</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="30+_female" />
                                </FormControl>
                                <FormLabel className="font-normal">30+ Female</FormLabel>
                            </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormDescription>To ensure diversity</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Profile Link</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Or write details about you, for example: I use Go for production, am learning Flutter, I’m Frontend dev, Senior Software Engineer..
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
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input placeholder="Your Lebanese phone number" {...field} />
              </FormControl>
               <FormDescription>
                will be used for follow up in case you missed registration over email.
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
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="personal_project"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you have any personal project or something public you would like to present for the community?</FormLabel>
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
              <FormLabel>Please select the technologies you are interested in</FormLabel>
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
              <FormLabel>Additional Comments or Suggestions</FormLabel>
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
