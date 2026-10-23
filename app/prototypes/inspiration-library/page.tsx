import Link from "next/link";
import { getServerSession, getMyBoards } from "./actions";
import { AuthBar } from "./components/AuthBar";
import { BoardListClient } from "./components/BoardListClient";
import styles from "./styles.module.css";

export const dynamic = "force-dynamic";

export default async function InspirationLibraryPage() {
  const session = await getServerSession();
  const user = session?.user;

  let boardsResult: { boards: import("./types").Board[]; isDbConfigured: boolean; error?: string } = {
    boards: [],
    isDbConfigured: true,
    error: undefined,
  };
  if (user) {
    boardsResult = await getMyBoards();
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainFrame}>
        {/* Top Navigation Bar */}
        <div className={styles.topBar}>
          <div className={styles.navLeft}>
            <Link href="/" className={styles.backButton}>
              <span>←</span>
              <span>Prototypes</span>
            </Link>
            <span className={styles.libraryBadge}>Inspiration Library</span>
          </div>

          <AuthBar user={user} />
        </div>

        {/* Database setup notice if DATABASE_URL is not set or schema missing */}
        {(!boardsResult.isDbConfigured || boardsResult.error) && (
          <div className={styles.setupBanner}>
            <p className={styles.setupBannerTitle}>
              <span>⚠️</span>
              <span>Supabase Database Setup Required</span>
            </p>
            <p className={styles.setupBannerText}>
              {!boardsResult.isDbConfigured
                ? "DATABASE_URL is not configured in .env.local yet. Please paste your Supabase Postgres connection string there."
                : boardsResult.error}
            </p>
            <p className={styles.setupBannerText}>
              Once you set <code className={styles.setupCode}>DATABASE_URL</code>, run the provided{" "}
              <code className={styles.setupCode}>app/prototypes/inspiration-library/schema.sql</code>{" "}
              in your <strong>Supabase SQL Editor</strong> to create the Better Auth and inspiration tables.
            </p>
          </div>
        )}

        {/* Main Content Area */}
        {user ? (
          /* Signed In: Board Management Dashboard */
          <main>
            <BoardListClient initialBoards={boardsResult.boards} />
          </main>
        ) : (
          /* Signed Out: Landing Page */
          <main className={styles.landingHero}>
            <p className={styles.landingTagline}>Personal Curation &amp; Visual Archive</p>
            <h1 className={styles.landingTitle}>
              Organize your creative world into boards.
            </h1>

            <div className={styles.landingActionRow}>
              <Link
                href="/prototypes/inspiration-library/sign-up"
                className={styles.authButtonPrimary}
                style={{ padding: "0.75rem 1.75rem", fontSize: "0.95rem" }}
              >
                Create Free Account
              </Link>
              <Link
                href="/prototypes/inspiration-library/sign-in"
                className={styles.authButtonSecondary}
                style={{ padding: "0.75rem 1.75rem", fontSize: "0.95rem" }}
              >
                Sign In
              </Link>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}