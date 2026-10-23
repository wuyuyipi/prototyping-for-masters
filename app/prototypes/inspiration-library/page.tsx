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
            <p className={styles.landingDescription}>
              A minimalist, tactile Are.na &amp; Pinterest prototype. Collect typography, imagery, architecture, and bookmarks into dedicated spaces with full privacy control.
            </p>

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

            <div className={styles.landingFeaturesGrid}>
              <div className={styles.landingFeatureCard}>
                <div className={styles.landingFeatureNumber}>01 / BETTER AUTH</div>
                <h3 className={styles.landingFeatureTitle}>Secure Session Engine</h3>
                <p className={styles.landingFeatureDesc}>
                  Powered by Better Auth and Supabase Postgres. Every server action strictly verifies sessions to keep your boards secure.
                </p>
              </div>

              <div className={styles.landingFeatureCard}>
                <div className={styles.landingFeatureNumber}>02 / PRIVACY MODES</div>
                <h3 className={styles.landingFeatureTitle}>Public &amp; Private Boards</h3>
                <p className={styles.landingFeatureDesc}>
                  Keep your work-in-progress inspirations private to yourself, or switch a board to public to share a read-only view with others.
                </p>
              </div>

              <div className={styles.landingFeatureCard}>
                <div className={styles.landingFeatureNumber}>03 / MASONRY ARCHIVE</div>
                <h3 className={styles.landingFeatureTitle}>Tactile Visual Grid</h3>
                <p className={styles.landingFeatureDesc}>
                  Save imagery, source links, titles, and annotations into a responsive masonry layout inspired by Are.na channels.
                </p>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}