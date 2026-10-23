"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import styles from "../styles.module.css";

interface AuthBarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    username?: string | null;
  } | null;
}

export function AuthBar({ user }: AuthBarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.refresh();
      router.push("/prototypes/inspiration-library");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (user) {
    const initials = (user.name || user.email || "U").charAt(0).toUpperCase();

    return (
      <div className={styles.navRight}>
        {user.username ? (
          <Link
            href={`/u/${user.username}`}
            className={styles.userBadge}
            title={`View your public profile (/u/${user.username})`}
          >
            <span className={styles.userAvatar}>{initials}</span>
            <span>{user.name || user.email}</span>
            <span className={styles.userBadgeHandle}>@{user.username}</span>
          </Link>
        ) : (
          <div className={styles.userBadge} title={user.email || ""}>
            <span className={styles.userAvatar}>{initials}</span>
            <span>{user.name || user.email}</span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={styles.authButtonSecondary}
          type="button"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className={styles.navRight}>
      <Link
        href="/prototypes/inspiration-library/sign-in"
        className={styles.authButtonSecondary}
      >
        Sign In
      </Link>
      <Link
        href="/prototypes/inspiration-library/sign-up"
        className={styles.authButtonPrimary}
      >
        Sign Up
      </Link>
    </div>
  );
}
