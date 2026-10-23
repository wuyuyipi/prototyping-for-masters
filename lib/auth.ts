import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { getPool } from "./db";

export const auth = betterAuth({
  database: getPool(),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  advanced: {
    database: {
      validateSchema: false,
    },
  },
  plugins: [nextCookies(), username()],
});

export type Session = typeof auth.$Infer.Session;
