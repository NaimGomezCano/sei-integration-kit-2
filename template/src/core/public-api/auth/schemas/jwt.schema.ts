import { z } from '@hono/zod-openapi'

export const LoginResponseSchema = z.object({
  token: z.string(),
  issued_at: z.string(),
  expired_at: z.string(),
})

export const LoginBodySchema = z.object({
  username: z.string(),
  password: z.string(),
})

export const JWTLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

export const JWTResponseSchema = z.object({
  token: z.string(),
})

export const ApiKeyRequestSchema = z.object({
  appName: z.string(),
})

export const ApiKeyResponseSchema = z.object({
  status: z.string(),
})

export const BasicAuthResponseSchema = z.object({
  message: z.string(),
  username: z.string(),
})

export type LoginBody = z.infer<typeof LoginBodySchema>
// {
//   username: string;
//   password: string;
// }

export type LoginResponse = z.infer<typeof LoginResponseSchema>
// {
//   token: string;
//   issued_at: string;
//   expired_at: string;
// }

export type JWTLogin = z.infer<typeof JWTLoginSchema>
// {
//   username: string;
//   password: string;
// }

export type JWTResponse = z.infer<typeof JWTResponseSchema>
// {
//   token: string;
// }

export type ApiKeyRequest = z.infer<typeof ApiKeyRequestSchema>
// {
//   appName: string;
// }

export type ApiKeyResponse = z.infer<typeof ApiKeyResponseSchema>
// {
//   status: string;
// }

export type BasicAuthResponse = z.infer<typeof BasicAuthResponseSchema>
// {
//   message: string;
//   username: string;
// }
