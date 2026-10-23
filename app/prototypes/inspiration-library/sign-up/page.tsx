"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import styles from "../styles.module.css";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Could not complete sign up.");
        setLoading(false);
        return;
      }

      router.push("/prototypes/inspiration-library");
      router.refresh();
    } catch (err: unknown) {
      console.error("Sign up error:", err);
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
              <h1 className={styles.authCardTitle}>Create Account</h1>
              <p className={styles.authCardSubtitle}>
                Start building your visual archive with Better Auth
              </p>
            </div>

            {error && <div className={styles.formErrorMessage}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formFieldGroup}>
                <label className={styles.formLabel} htmlFor="name">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Yiping Dong"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formFieldGroup}>
                <label className={styles.formLabel} htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
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
                  placeholder="At least 6 characters"
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
                  {loading ? "Creating account..." : "Sign Up"}
                </button>
              </div>
            </form>

            <div className={styles.authCardFooter}>
              <span>Already have an account?</span>
              <Link
                href="/prototypes/inspiration-library/sign-in"
                className={styles.authCardLink}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
