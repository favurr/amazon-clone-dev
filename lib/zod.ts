import { z } from "zod";

export const signupSchema = z.object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name is too long"),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name is too long"),

    email: z
      .string()
      .email("Please enter a valid email address")
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),

  password: z.string().min(1, "Password is required"),

  rememberMe: z.boolean().default(false).optional(),
});

// Shared Variant Schema
const ProductVariantSchema = z.object({
  type: z.string().min(1, "Type required (e.g. Storage)"),
  value: z.string().min(1, "Value required (e.g. 1TB)"),
  stock: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
});

const productImageSchema = z.object({
  url: z.string().url({ message: "Valid URL is required" }),
  key: z.string().min(1, { message: "Image key is required" }),
  altText: z.string().optional().nullable(), // Allow nullable for better compatibility
  order: z.number(), // Remove the .default(0) here, or ensure it's a strict number
});

export const productSchema = z.object({
  title: z.string().min(2, "Title too short"),
  description: z.string().min(10, "Description too short"),
  slug: z.string().optional(),
  titlePrice: z.coerce.number().min(0.01),
  discountedPrice: z.coerce.number().optional().nullable(),
  categoryId: z.string().min(1),
  mainImageUrl: z.string().url(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  tags: z.array(z.string()).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
  images: z.array(productImageSchema).default([]),
  variants: z.array(ProductVariantSchema).default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductImageValues = z.infer<typeof productImageSchema>;

export type FormInput = z.input<typeof productSchema>; // { age: string }
export type FormOutput = z.output<typeof productSchema>; // { age: number }

export type ImageInput = z.input<typeof productImageSchema>; // { age: string }
export type ImageOutput = z.output<typeof productImageSchema>; // { age: number }
