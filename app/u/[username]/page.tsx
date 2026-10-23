import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession, getPublicProfile } from "@/app/prototypes/inspiration-library/actions";
import { AuthBar } from "@/app/prototypes/inspiration-library/components/AuthBar";
import styles from "./styles.module.css";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).trim();

  return {
    title: `@${username} | Inspiration Library`,
    description: `Public visual inspiration archive and curated boards by @${username}.`,
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).trim();

  const [session, profileResult] = await Promise.all([
    getServerSession(),
    getPublicProfile(username),
  ]);

  const currentUser = session?.user;
  const { profile, notFound: isUserNotFound, error, isDbConfigured } = profileResult;

  // Not Found state (user doesn't exist)
  if (isUserNotFound || !profile) {
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

            <AuthBar user={currentUser} />
          </div>

          <div className={styles.notFoundCard}>
            <span className={styles.notFoundCode}>404 / USER NOT FOUND</span>
            <h1 className={styles.notFoundTitle}>Profile @{username} not found</h1>
            <p className={styles.notFoundText}>
              There is no account registered with the handle &ldquo;{username}&rdquo;. It may have been typed incorrectly or changed.
            </p>
            <Link href="/prototypes/inspiration-library" className={styles.primaryActionButton}>
              Back to Inspiration Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, boards } = profile;
  const isOwner = currentUser?.id === user.id;
  const displayName = user.name || user.displayUsername || user.username;
  const displayHandle = user.displayUsername || user.username;
  const initial = (displayName || "U").charAt(0).toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.mainFrame}>
        {/* Top Navigation */}
        <div className={styles.topBar}>
          <div className={styles.navLeft}>
            <Link href="/prototypes/inspiration-library" className={styles.backButton}>
              <span>←</span>
              <span>Inspiration Library</span>
            </Link>
            <span className={styles.routeBadge}>/u/{displayHandle}</span>
          </div>

          <AuthBar user={currentUser} />
        </div>

        {/* Database setup notice if error */}
        {(!isDbConfigured || error) && (
          <div className={styles.notFoundCard}>
            <span className={styles.notFoundCode}>DATABASE NOTICE</span>
            <p className={styles.notFoundText}>{error}</p>
          </div>
        )}

        {/* User Profile Banner */}
        <div className={styles.profileBanner}>
          <div className={styles.profileInfo}>
            {user.image ? (
              <img
                src={user.image}
                alt={displayName}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarCircle}>{initial}</div>
            )}

            <div className={styles.userDetails}>
              <h1 className={styles.displayName}>{displayName}</h1>
              <div className={styles.metaRow}>
                <span className={styles.usernameTag}>@{displayHandle}</span>
                <span className={styles.profileBoardCount}>
                  {boards.length} {boards.length === 1 ? "PUBLIC BOARD" : "PUBLIC BOARDS"}
                </span>
                {isOwner && (
                  <span className={styles.ownerNoticePill}>
                    <span>👁️</span>
                    <span>Viewing your public profile</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.profileActions}>
            {isOwner ? (
              <Link
                href="/prototypes/inspiration-library"
                className={styles.manageBoardsButton}
              >
                <span>+</span>
                <span>Manage Your Boards</span>
              </Link>
            ) : null}
          </div>
        </div>

        {/* Public Boards Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Public Boards</h2>
          <span className={styles.sectionSubtitle}>
            Showing only public collections curated by @{displayHandle}
          </span>
        </div>

        {boards.length === 0 ? (
          <div className={styles.emptyStateCard}>
            <span className={styles.emptyStateIcon}>📂</span>
            <h3 className={styles.emptyStateTitle}>No public boards yet</h3>
            <p className={styles.emptyStateText}>
              {isOwner
                ? "You haven't published any public boards yet. Private boards are only visible to you in your Inspiration Library."
                : `@${displayHandle} hasn't made any boards public yet.`}
            </p>
            {isOwner && (
              <Link
                href="/prototypes/inspiration-library"
                className={styles.primaryActionButton}
                style={{ marginTop: "0.75rem" }}
              >
                Go to Library to Publish a Board
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.boardsGrid}>
            {boards.map((board) => {
              const formattedDate = new Date(board.created_at).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              );

              return (
                <Link
                  key={board.id}
                  href={`/prototypes/inspiration-library/boards/${board.id}`}
                  className={styles.boardCard}
                >
                  <div className={styles.boardCardTop}>
                    <div className={styles.boardPrivacyRow}>
                      <span className={styles.publicTag}>● Public</span>
                      <span className={styles.boardDate}>{formattedDate}</span>
                    </div>

                    <h3 className={styles.boardTitle}>{board.title}</h3>

                    {board.description && (
                      <p className={styles.boardDescription}>{board.description}</p>
                    )}
                  </div>

                  <div className={styles.boardCardBottom}>
                    <span className={styles.itemCount}>
                      {board.item_count} {board.item_count === 1 ? "ITEM" : "ITEMS"}
                    </span>
                    <span className={styles.viewBoardPrompt}>
                      <span>Explore</span>
                      <span>→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
