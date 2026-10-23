import Link from "next/link";
import { getServerSession, getBoardAndItems } from "../../actions";
import { AuthBar } from "../../components/AuthBar";
import { BoardDetailClient } from "../../components/BoardDetailClient";
import styles from "../../styles.module.css";

export const dynamic = "force-dynamic";

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params;
  const session = await getServerSession();
  const user = session?.user;

  const result = await getBoardAndItems(id);

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
          </div>

          <AuthBar user={user} />
        </div>

        {/* Database notice if not configured or table missing */}
        {(!result.isDbConfigured || result.error) && !result.notFound && (
          <div className={styles.setupBanner}>
            <p className={styles.setupBannerTitle}>
              <span>⚠️</span>
              <span>Supabase Database Notice</span>
            </p>
            <p className={styles.setupBannerText}>
              {!result.isDbConfigured
                ? "DATABASE_URL is not set in .env.local yet."
                : result.error}
            </p>
            <p className={styles.setupBannerText}>
              Ensure you have set <code className={styles.setupCode}>DATABASE_URL</code> and executed{" "}
              <code className={styles.setupCode}>schema.sql</code> in your Supabase SQL editor.
            </p>
          </div>
        )}

        {/* Not Found View (For missing boards or private boards accessed by non-owners) */}
        {result.notFound ? (
          <div className={styles.notFoundCard}>
            <span className={styles.notFoundCode}>404 / PRIVATE</span>
            <h1 className={styles.notFoundTitle}>Board Not Found</h1>
            <p className={styles.notFoundText}>
              This board does not exist or has been marked as private by its curator. If this is your board, please sign in with the owner account to view it.
            </p>
            <Link
              href="/prototypes/inspiration-library"
              className={styles.authButtonPrimary}
              style={{ padding: "0.65rem 1.5rem" }}
            >
              Return to Inspiration Library
            </Link>
          </div>
        ) : result.data ? (
          /* Render Board with Masonry Grid */
          <main>
            <BoardDetailClient
              board={result.data.board}
              initialItems={result.data.items}
              isOwner={result.data.isOwner}
            />
          </main>
        ) : null}
      </div>
    </div>
  );
}
