import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { hashPassword, normalizeEmail, verifyPassword } from "./credentials";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const credentialsInput = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

const registrationInput = credentialsInput.extend({
  name: z.string().trim().min(2).max(80),
});

const SESSION_MS = 1000 * 60 * 60 * 12;

function setSessionCookie(ctx: { req: Parameters<typeof getSessionCookieOptions>[0]; res: { cookie: (name: string, value: string, options: Record<string, unknown>) => void } }, token: string, remember: boolean) {
  const cookieOptions = getSessionCookieOptions(ctx.req);
  ctx.res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    ...(remember ? { maxAge: ONE_YEAR_MS } : {}),
  });
}

function authError(message = "Email or password is incorrect") {
  return new TRPCError({ code: "UNAUTHORIZED", message });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    register: publicProcedure
      .input(registrationInput.extend({ remember: z.boolean().default(true) }))
      .mutation(async ({ ctx, input }) => {
        const email = normalizeEmail(input.email);
        const existing = await db.getCredentialAccountByEmail(email).catch((error) => {
          if (error instanceof Error && error.message === "DATABASE_UNAVAILABLE") throw error;
          return null;
        });
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "An account with that email already exists" });

        const password = await hashPassword(input.password);
        const openId = `credentials:${crypto.randomUUID()}`;
        let user;
        try {
          user = await db.createCredentialUser({
            openId,
            name: input.name,
            email,
            passwordHash: password.passwordHash,
            passwordSalt: password.passwordSalt,
          });
        } catch (error) {
          if (error instanceof Error && error.message === "DATABASE_UNAVAILABLE") {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Account storage is not configured yet" });
          }
          throw new TRPCError({ code: "CONFLICT", message: "That email is already registered" });
        }

        const token = await sdk.createSessionToken(user.openId, {
          expiresInMs: input.remember ? ONE_YEAR_MS : SESSION_MS,
          name: user.name ?? input.name,
        });
        setSessionCookie(ctx, token, input.remember);
        return { user, success: true } as const;
      }),
    signIn: publicProcedure
      .input(credentialsInput.extend({ remember: z.boolean().default(true) }))
      .mutation(async ({ ctx, input }) => {
        const email = normalizeEmail(input.email);
        const record = await db.getCredentialAccountByEmail(email).catch((error) => {
          if (error instanceof Error && error.message === "DATABASE_UNAVAILABLE") {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Account storage is not configured yet" });
          }
          return null;
        });
        if (!record) {
          const existingUser = await db.getUserByEmail(email);
          if (existingUser && existingUser.loginMethod && existingUser.loginMethod !== "credentials") {
            const provider = existingUser.loginMethod === "google" ? "Google" : existingUser.loginMethod;
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: `This account uses ${provider} sign-in. Choose Continue with ${provider}.` });
          }
          throw authError();
        }

        const valid = await verifyPassword(input.password, record.account.passwordHash, record.account.passwordSalt);
        if (!valid) throw authError();
        await db.updateUserLastSignedIn(record.user.id);

        const token = await sdk.createSessionToken(record.user.openId, {
          expiresInMs: input.remember ? ONE_YEAR_MS : SESSION_MS,
          name: record.user.name ?? email,
        });
        setSessionCookie(ctx, token, input.remember);
        return { user: record.user, success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
