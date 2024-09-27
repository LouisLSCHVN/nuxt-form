import { z } from 'zod'

export const createUserValidator = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(256, { message: 'Password must be at most 256 characters' }),
  avatar: z.any().optional(),
})
