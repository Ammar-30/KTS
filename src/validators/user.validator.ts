/**
 * Zod schemas for user validation
 */

import { z } from "zod";
import { ROLES } from "@/lib/constants";

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  role: z.enum([
    ROLES.EMPLOYEE,
    ROLES.MANAGER,
    ROLES.TRANSPORT,
    ROLES.ADMIN,
  ]),
  department: z.string().max(100).optional().nullable(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      // At least one letter and one number
      return /[A-Za-z]/.test(data.newPassword) && /\d/.test(data.newPassword);
    },
    {
      message: "Password must include at least one letter and one number",
      path: ["newPassword"],
    }
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;





