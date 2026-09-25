import Link from "next/link";
import styles from './styles/home.module.css';

export default function Home() {
  // Add your prototypes to this array
  const prototypes = [
    {
      title: 'Getting started',
      description: 'How to create a prototype\n\u00A0',
      path: '/prototypes/example',
      tag: '01 / Guide'
    },
    {
      title: 'Confetti button',
      description: 'An interactive button that creates a colorful confetti explosion',
      path: '/prototypes/confetti-button',
      tag: '02 / Interactive'
    },
    // Add your new prototypes here like this:
    // {
    //   title: 'Your new prototype',
    //   description: 'A short description of what this prototype does',
    //   path: '/prototypes/my-new-prototype',
    //   tag: '03 / Experiment'
    // },
  ];

  // Add your blog posts to this array
  const blogs = [
    {
      title: 'Design Philosophy & Tools',
      description: 'Exploring creative technology, craft, and physical-digital workflows in modern prototyping.',
      path: '#',
      tag: '01 / Article'
    },
    {
      title: 'Studio Process & Documentation',
      description: 'Notes and insights on iterative prototyping, experimentation, and design thinking.',
      path: '#',
      tag: '02 / Note'
    },
    // Add your new blog posts here like this:
    // {
    //   title: 'Your new post',
    //   description: 'A short description of what this post is about',
    //   path: '/blogs/my-new-post',
    //   tag: '03 / Thought'
    // },
  ];

  return (
    <div className={styles.mainContainer}>

      {/* Background "Prototypes" Typographic Watermark behind .main */}
      <div className={styles.bgPrototypesWatermark} aria-hidden="true">
        Prototypes
      </div>

      {/* Background Signature Overlay at bottom-right */}
      <div className={styles.bgSignature} aria-hidden="true">
        <img 
          src="/img/Yiping.svg" 
          alt="" 
          className={styles.bgSignatureImg} 
        />
      </div>

      {/* Floating Bottom Course & Copyright Tag */}
      <div className={styles.footerContainer}>
        <span className={styles.footerText}>
          © 2026 Yiping Dong
        </span>
      </div>

      {/* Central Framed Scrollable Paper Sheet */}
      <div className={styles.main}>
        <div className={styles.mainContent}>
          {/* Top Meta Badges Row */}
          <header className={styles.headerMetaRow}>
            <span className={styles.headerBadge}>YIPING DONG</span>
            <span className={styles.headerSubTag}>Prototyping for Masters</span>
          </header>

          {/* Hero Section */}
          <section className={styles.heroSection}>
            <p className={styles.introText}>
              Home of Yiping&apos;s projects and documentations from Prototyping for Masters of Fall 2026.
            </p>
          </section>

          {/* Two-Column Side-by-Side Sections: Works & Prototypes and Blogs */}
          <div className={styles.twoColumnLayout}>
            {/* Works & Prototypes Section */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionBadge}>Works &amp; Prototypes</h2>
                <div className={styles.sectionRule} />
                <span className={styles.sectionCounter}>{prototypes.length} Projects</span>
              </div>

              <div className={styles.grid}>
                {prototypes.map((prototype, index) => (
                  <Link 
                    key={index}
                    href={prototype.path} 
                    className={styles.card}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.cardTag}>
                        <span className={styles.squareBullet} />
                        {prototype.tag || `0${index + 1} / Prototype`}
                      </span>
                    </div>

                    <h3 className={styles.cardTitle}>{prototype.title}</h3>
                    <p className={styles.cardDescription}>{prototype.description}</p>

                    <div className={styles.cardFooter}>
                      <span className={styles.cardLinkText}>Open Prototype</span>
                      <span className={styles.cardArrow}>↗</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Blogs Section */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionBadge}>Blogs</h2>
                <div className={styles.sectionRule} />
                <span className={styles.sectionCounter}>{blogs.length} Posts</span>
              </div>

              <div className={styles.grid}>
                {blogs.map((blog, index) => (
                  <Link 
                    key={index}
                    href={blog.path} 
                    className={styles.card}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.cardTag}>
                        <span className={styles.squareBullet} />
                        {blog.tag || `0${index + 1} / Post`}
                      </span>
                    </div>

                    <h3 className={styles.cardTitle}>{blog.title}</h3>
                    <p className={styles.cardDescription}>{blog.description}</p>

                    <div className={styles.cardFooter}>
                      <span className={styles.cardLinkText}>Read Post</span>
                      <span className={styles.cardArrow}>↗</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
