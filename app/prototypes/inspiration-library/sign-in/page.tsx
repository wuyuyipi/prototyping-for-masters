"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import styles from "../styles.module.css";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const identifier = email.trim();

    try {
      let result;
      if (identifier.includes("@")) {
        result = await authClient.signIn.email({
          email: identifier,
          password,
        });
      } else {
        result = await authClient.signIn.username({
          username: identifier.toLowerCase(),
          password,
        });
      }

      if (result.error) {
        setError(result.error.message || "Invalid username/email or password.");
        setLoading(false);
        return;
      }

      router.push("/prototypes/inspiration-library");
      router.refresh();
    } catch (err: unknown) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred. Please check your database connection.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainFrame}>
        <div className={styles.topBar}>
          <div className={styles.navLeft}>
            <Link href="/prototypes/inspiration-library" className={styles.backButton}>
              <span>←</span>
              <span>Inspiration Library</span>
            </Link>
          </div>
        </div>

        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            <div className={styles.authCardHeader}>
              <h1 className={styles.authCardTitle}>Sign In</h1>
              <p className={styles.authCardSubtitle}>
                Access your personal inspiration boards and bookmarks
              </p>
            </div>

            {error && <div className={styles.formErrorMessage}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formFieldGroup}>
                <label className={styles.formLabel} htmlFor="email">
                  Email or Username
                </label>
                <input
                  id="email"
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com or username"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formFieldGroup}>
                <label className={styles.formLabel} htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formActionRow}>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.formSubmitButton}
                  style={{ width: "100%" }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>

            <div className={styles.authCardFooter}>
              <span>Don&apos;t have an account?</span>
              <Link
                href="/prototypes/inspiration-library/sign-up"
                className={styles.authCardLink}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
