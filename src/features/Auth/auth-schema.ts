import { z } from "zod";
export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1).max(70),
    lastName: z.string().trim().min(1).max(70),
    email: z.email().trim().toLowerCase().max(254),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
    buildingId: z.number().int().positive(),
    floorId: z.number().int().positive(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passordene er ikke like",
    path: ["confirmPassword"],
  });
export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
  confirmPassword: z.string(),
}).refine(
  data => data.newPassword === data.confirmPassword,
  {
    message: "De nye passordene er ikke like",
    path: ["confirmPassword"],
  }
);
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
