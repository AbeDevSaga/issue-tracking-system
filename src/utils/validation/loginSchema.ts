import * as z from "zod";

// Ethiopian phone number regex
const ethiopianPhoneRegex = /^(?:\+251|251|0)?9\d{8}$/;

export const signInSchema = z
  .object({
    email: z
      .string()
      .email("Please enter a valid email address")
      .optional()
      .or(z.literal("")),
    phoneNumber: z
      .string()
      .refine(
        (val) => !val || ethiopianPhoneRegex.test(val.replace(/\D/g, "")),
        {
          message: "Please enter a valid Ethiopian phone number",
        }
      )
      .optional()
      .or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number is required",
    path: ["email"], // This will show the error on the email field
  });

export type SignInFormData = z.infer<typeof signInSchema>;
