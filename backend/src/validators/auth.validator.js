import { z } from "zod";

// ============ Shared Schemas ============

const emailSchema = z
    .string()
    .email("Invalid email format")
    .max(253, "Email too long")

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long");

// ============ Auth Schemas ============

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
