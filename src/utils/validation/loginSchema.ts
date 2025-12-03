import * as z from "zod";

// Ethiopian phone number regex
const ethiopianPhoneRegex = /^(?:\+251|251|0)?9\d{8}$/;

export const signInSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or phone number is required")
    .refine((val) => {
      const cleaned = val.replace(/\D/g, "");
      return val.includes("@") || ethiopianPhoneRegex.test(cleaned);
    }, "Please enter a valid email or Ethiopian phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignInFormData = z.infer<typeof signInSchema>;
