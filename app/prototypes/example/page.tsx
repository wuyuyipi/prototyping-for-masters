import styles from './styles.module.css';
import Link from 'next/link';

export default function ExamplePrototype() {
  return (
    <div className={styles.container}>
      {/* Floating Bottom Course Tag */}
      <div className={styles.footerContainer}>
        <span className={styles.footerText}>
          © 2026 Yiping Dong
        </span>
        <span className={styles.footerTag}>01 / Guide</span>
      </div>

      {/* Central Framed Paper Sheet */}
      <div className={styles.main}>
        <div className={styles.contentWrapper}>
          {/* Top Navigation Bar */}
          <div className={styles.topNav}>
            <Link href="/" className={styles.backButton}>
              <span>←</span>
              <span>Prototypes</span>
            </Link>
            <span className={styles.categoryBadge}>01 / Guide</span>
          </div>

          <h1 className={styles.heading1}>
            How to create a prototype
          </h1>

          <p className={styles.introDescription}>
            A step-by-step guide for building and integrating new prototypes into this portfolio.
          </p>

          <div className={styles.section}>
            <h2 className={styles.heading2}>
              <span className={styles.heading2Span}>Steps</span>
            </h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.bulletNumber}>1</span> Open Composer Agent (⌘-I)
              </li>
              <li className={styles.listItem}>
                <span className={styles.bulletNumber}>2</span> Type: &quot;Create a prototype for me&quot;
              </li>
              <li className={styles.listItem}>
                <span className={styles.bulletNumber}>3</span> Describe the key features you need
              </li>
              <li className={styles.listItem}>
                <span className={styles.bulletNumber}>4</span> Share any design preferences
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.heading2}>
              <span className={styles.heading2Span}>Guidelines</span>
            </h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.squareBullet} /> Use shared components from components folder
              </li>
              <li className={styles.listItem}>
                <span className={styles.squareBullet} /> Use shared styles from styles folder
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}