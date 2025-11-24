import * as z from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(3, "Password must be at least 6 characters"),
});

export type SignInFormData = z.infer<typeof signInSchema>;
