"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import styles from "./styles.module.css";

export interface BookItem {
  id: string;
  title: string;
  author: string;
  genre: {
    name: string;
    color: string;
  } | null;
  coverImage: string | null;
  rating: number | null;
  review: string;
  notionUrl?: string;
  lastEditedTime?: string;
}

interface BookPosition {
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}

type ViewMode = "pile" | "tidy";

export default function MyBookshelfPrototype() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [databaseTitle, setDatabaseTitle] = useState<string>("My Bookshelf");
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuggestion, setApiSuggestion] = useState<string | null>(null);

  // View mode: Pile vs Tidy
  const [viewMode, setViewMode] = useState<ViewMode>("pile");

  // Book positions for the draggable pile
  const [positions, setPositions] = useState<Record<string, BookPosition>>({});
  const maxZIndexRef = useRef<number>(20);

  // Dragging state
  const deskRef = useRef<HTMLDivElement>(null);
  const dragInfoRef = useRef<{
    bookId: string;
    startPointerX: number;
    startPointerY: number;
    startBookX: number;
    startBookY: number;
    hasMoved: boolean;
  } | null>(null);
  const justDraggedRef = useRef<boolean>(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Selected book for Pop-up window modal
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);

  // Setup modal state
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [inputApiKey, setInputApiKey] = useState<string>("");
  const [inputDbId, setInputDbId] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectMessage, setConnectMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Generate randomized positions for books in the pile
  const randomizePositions = useCallback((items: BookItem[]) => {
    if (items.length === 0) return;
    const newPositions: Record<string, BookPosition> = {};
    const deskWidth = deskRef.current ? deskRef.current.clientWidth : 780;
    const deskHeight = deskRef.current ? deskRef.current.clientHeight : 680;

    const bookW = 154;
    const bookH = 226;
    const margin = 30;

    const maxX = Math.max(margin, deskWidth - bookW - margin);
    const maxY = Math.max(margin, deskHeight - bookH - margin);

    items.forEach((book, index) => {
      // Golden angle / cluster distribution with random jitter
      const angle = index * 1.618 * Math.PI * 2;
      const radius = 60 + Math.sqrt(index) * 85;
      const centerX = deskWidth / 2 - bookW / 2;
      const centerY = deskHeight / 2 - bookH / 2;

      let x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 60;
      let y = centerY + Math.sin(angle) * (radius * 0.75) + (Math.random() - 0.5) * 60;

      // Clamp within boundaries
      x = Math.max(margin, Math.min(maxX, x));
      y = Math.max(margin, Math.min(maxY, y));

      // Random gentle rotation between -16° and +16°
      const rotation = Math.round((Math.random() - 0.5) * 32);

      newPositions[book.id] = {
        x,
        y,
        rotation,
        zIndex: index + 1,
      };
    });

    maxZIndexRef.current = items.length + 5;
    setPositions(newPositions);
  }, []);

  // Fetch books from our Next.js API
  const fetchBooks = useCallback(async (customKey?: string, customDb?: string) => {
    setLoading(true);
    setApiError(null);
    setApiSuggestion(null);

    try {
      const headers: Record<string, string> = {};
      const keyToUse = customKey ?? (typeof window !== "undefined" ? localStorage.getItem("notion_user_api_key") || "" : "");
      const dbToUse = customDb ?? (typeof window !== "undefined" ? localStorage.getItem("notion_user_database_id") || "" : "");

      if (keyToUse.trim()) headers["x-notion-api-key"] = keyToUse.trim();
      if (dbToUse.trim()) headers["x-notion-database-id"] = dbToUse.trim();

      const res = await fetch("/api/bookshelf", { headers });
      const data = await res.json();

      if (data.success) {
        setBooks(data.books || []);
        setIsDemo(Boolean(data.isDemo));
        if (data.databaseTitle) setDatabaseTitle(data.databaseTitle);
        randomizePositions(data.books || []);
      } else {
        if (data.fallbackBooks) {
          setBooks(data.fallbackBooks);
          randomizePositions(data.fallbackBooks);
        }
        setIsDemo(true);
        setApiError(data.error || "Failed to load Notion books.");
        setApiSuggestion(data.suggestion || "Please verify your Notion credentials.");
      }
    } catch (err: any) {
      console.error("Failed to fetch bookshelf:", err);
      setApiError("Network error while connecting to Bookshelf API.");
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, [randomizePositions]);

  // Initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("notion_user_api_key") || "";
      const savedDb = localStorage.getItem("notion_user_database_id") || "";
      setInputApiKey(savedKey);
      setInputDbId(savedDb);
      fetchBooks(savedKey, savedDb);
    } else {
      fetchBooks();
    }
  }, [fetchBooks]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedBook(null);
        setShowSetupModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Save credentials in modal
  const handleSaveCredentials = async () => {
    setIsConnecting(true);
    setConnectMessage(null);

    try {
      const headers: Record<string, string> = {};
      if (inputApiKey.trim()) headers["x-notion-api-key"] = inputApiKey.trim();
      if (inputDbId.trim()) headers["x-notion-database-id"] = inputDbId.trim();

      const res = await fetch("/api/bookshelf", { headers });
      const data = await res.json();

      if (data.success && !data.isDemo) {
        localStorage.setItem("notion_user_api_key", inputApiKey.trim());
        localStorage.setItem("notion_user_database_id", inputDbId.trim());
        setBooks(data.books || []);
        setIsDemo(false);
        if (data.databaseTitle) setDatabaseTitle(data.databaseTitle);
        randomizePositions(data.books || []);
        setConnectMessage({
          text: `Connected to "${data.databaseTitle}" with ${data.books?.length || 0} books!`,
          isError: false,
        });
      } else if (data.error) {
        setConnectMessage({
          text: `${data.error} ${data.suggestion ? `(${data.suggestion})` : ""}`,
          isError: true,
        });
      } else {
        setConnectMessage({
          text: "Saved. Previewing demo books.",
          isError: false,
        });
      }
    } catch (err: any) {
      setConnectMessage({
        text: err.message || "Failed to connect to Notion.",
        isError: true,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClearCredentials = () => {
    localStorage.removeItem("notion_user_api_key");
    localStorage.removeItem("notion_user_database_id");
    setInputApiKey("");
    setInputDbId("");
    setConnectMessage({ text: "Reset to demo data.", isError: false });
    fetchBooks("", "");
  };

  // Drag handlers for the Pile
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, bookId: string) => {
    if (viewMode !== "pile") return;
    e.preventDefault();
    const currentPos = positions[bookId];
    if (!currentPos) return;

    justDraggedRef.current = false;

    // Bring this book to the top of the stack
    maxZIndexRef.current += 1;
    setPositions((prev) => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        zIndex: maxZIndexRef.current,
      },
    }));

    dragInfoRef.current = {
      bookId,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startBookX: currentPos.x,
      startBookY: currentPos.y,
      hasMoved: false,
    };

    setDraggingId(bookId);
    setHoveredBookId(bookId);

    // Capture pointer
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfoRef.current || viewMode !== "pile") return;
    const { bookId, startPointerX, startPointerY, startBookX, startBookY } = dragInfoRef.current;

    const deltaX = e.clientX - startPointerX;
    const deltaY = e.clientY - startPointerY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragInfoRef.current.hasMoved = true;
      justDraggedRef.current = true;
    }

    const deskWidth = deskRef.current ? deskRef.current.clientWidth : 780;
    const deskHeight = deskRef.current ? deskRef.current.clientHeight : 680;
    const bookW = 154;
    const bookH = 226;

    // Clamp within desk container
    const newX = Math.max(0, Math.min(deskWidth - bookW, startBookX + deltaX));
    const newY = Math.max(0, Math.min(deskHeight - bookH, startBookY + deltaY));

    setPositions((prev) => {
      const existing = prev[bookId];
      if (!existing) return prev;
      return {
        ...prev,
        [bookId]: {
          ...existing,
          x: newX,
          y: newY,
        },
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragInfoRef.current) {
      const { hasMoved } = dragInfoRef.current;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
      dragInfoRef.current = null;

      if (hasMoved) {
        justDraggedRef.current = true;
        // Keep justDraggedRef true for 200ms to suppress browser click event after drag
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 200);
      }
    }
    setDraggingId(null);
  };

  // Keyboard shortcut: close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedBook(null);
        setShowSetupModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Hovered book object for hover preview features
  const hoveredBook = useMemo(() => {
    if (!hoveredBookId) return null;
    return books.find((b) => b.id === hoveredBookId) || null;
  }, [books, hoveredBookId]);

  // Reading stats
  const stats = useMemo(() => {
    const total = books.length;
    if (total === 0) return { total: 0, avgRating: "0.0", topGenre: "—" };

    const rated = books.filter((b) => typeof b.rating === "number" && b.rating > 0);
    const avgRating =
      rated.length > 0
        ? (rated.reduce((sum, b) => sum + (b.rating ?? 0), 0) / rated.length).toFixed(1)
        : "—";

    const genreCounts: Record<string, number> = {};
    books.forEach((b) => {
      if (b.genre?.name) {
        genreCounts[b.genre.name] = (genreCounts[b.genre.name] || 0) + 1;
      }
    });

    let topGenre = "—";
    let max = 0;
    Object.entries(genreCounts).forEach(([g, c]) => {
      if (c > max) {
        max = c;
        topGenre = g;
      }
    });

    return { total, avgRating, topGenre };
  }, [books]);

  // Color generator for spines in Tidy view
  const getSpineColor = (book: BookItem, index: number) => {
    if (book.genre?.color === "purple") return "#3E2752";
    if (book.genre?.color === "orange") return "#7C3B1E";
    if (book.genre?.color === "blue") return "#163E52";
    if (book.genre?.color === "green") return "#234D36";
    if (book.genre?.color === "pink") return "#5C2642";
    if (book.genre?.color === "yellow") return "#63471A";

    const defaultColors = ["#1A2628", "#0C4F56", "#2D3748", "#334155", "#1E293B", "#3F3D56"];
    return defaultColors[index % defaultColors.length];
  };

  // Width generator for spines in Tidy view (slight realistic trim variation)
  const getSpineWidth = (index: number) => {
    const widths = [380, 420, 395, 410, 370, 430, 385, 400, 375, 415, 390, 405];
    return widths[index % widths.length];
  };

  return (
    <div className={styles.container}>
      {/* Floating Bottom Course & Copyright Tag */}
      <div className={styles.footerContainer}>
        <span className={styles.footerText}>© 2026 Yiping Dong · Prototyping for Masters</span>
        <span className={styles.footerTag}>06 / Notion Integration</span>
      </div>

      <div className={styles.mainFrame}>
        {/* Top Navigation */}
        <nav className={styles.topNav} aria-label="Bookshelf Navigation">
          <Link href="/" className={styles.backButton}>
            <span>←</span>
            <span>Prototypes</span>
          </Link>

          <div className={styles.topActions}>
            {/* View Mode: Pile vs Tidy */}
            <div className={styles.modeSelector}>
              <button
                type="button"
                className={`${styles.modeButton} ${viewMode === "pile" ? styles.modeButtonActive : ""}`}
                onClick={() => setViewMode("pile")}
                title="Scatter books on desk to drag around"
              >
                <span>🔀</span>
                <span>Pile</span>
              </button>
              <button
                type="button"
                className={`${styles.modeButton} ${viewMode === "tidy" ? styles.modeButtonActive : ""}`}
                onClick={() => setViewMode("tidy")}
                title="Neat vertical stack showing book spines"
              >
                <span>📚</span>
                <span>Tidy</span>
              </button>
            </div>

            {viewMode === "pile" && (
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => randomizePositions(books)}
                title="Re-toss the pile across the desk"
              >
                <span>🎲</span>
                <span>Toss &amp; Scatter</span>
              </button>
            )}

            <button
              type="button"
              className={styles.actionButton}
              onClick={() => setShowSetupModal(true)}
              title="Configure Notion Credentials"
            >
              <span>⚙️</span>
              <span>Notion Setup</span>
            </button>

            <button
              type="button"
              className={styles.actionButton}
              onClick={() => fetchBooks()}
              title="Refresh database records"
              disabled={loading}
            >
              <span>⟳</span>
              <span>{loading ? "..." : "Refresh"}</span>
            </button>
          </div>
        </nav>

        {/* Header Section */}
        <header className={styles.headerSection}>
          <div className={styles.headerTitleRow}>
            <div>
              <h1 className={styles.headerTitle}>{databaseTitle}</h1>
            </div>

            <div className={styles.headerStatsPill}>
              <span className={styles.headerStatItem}>
                <span>Books:</span>
                <strong className={styles.headerStatValue}>{stats.total}</strong>
              </span>
              <span>·</span>
              <span className={styles.headerStatItem}>
                <span>Avg:</span>
                <strong className={styles.headerStatValue}>{stats.avgRating} ★</strong>
              </span>
              <span>·</span>
              <span className={styles.headerStatItem}>
                <span>Top:</span>
                <strong className={styles.headerStatValue}>{stats.topGenre}</strong>
              </span>
            </div>
          </div>

          {apiError && (
            <div className={styles.alertBoxError}>
              <strong>Notion Notice:</strong> {apiError}
              {apiSuggestion && <div>{apiSuggestion}</div>}
            </div>
          )}
        </header>

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Gathering books from Notion database...</p>
          </div>
        )}

        {/* Two-Column Interactive Workspace: Desk / Stack on the left, Side Info Box on the right */}
        {!loading && (
          <div className={styles.workspaceLayout}>
            {/* LEFT / MAIN WORKSPACE */}
            <div className={styles.deskWorkspace}>
              {/* PILE VIEW: Freeform Drag & Drop Desk Mat */}
              {viewMode === "pile" && (
                <div
                  ref={deskRef}
                  className={styles.deskSurface}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                >
                  <div className={styles.deskCornerMarkTopLeft} />
                  <div className={styles.deskCornerMarkBottomRight} />

                  {books.map((book) => {
                    const pos = positions[book.id] || { x: 100, y: 100, rotation: 0, zIndex: 1 };
                    const isDragging = draggingId === book.id;
                    const isHovered = hoveredBookId === book.id;

                    return (
                      <div
                        key={book.id}
                        className={`${styles.pileBook} ${isDragging ? styles.pileBookDragging : ""} ${
                          isHovered ? styles.pileBookHovered : ""
                        }`}
                        style={{
                          left: `${pos.x}px`,
                          top: `${pos.y}px`,
                          zIndex: pos.zIndex,
                          transform: `rotate(${pos.rotation}deg)${isDragging ? " scale(1.06)" : ""}`,
                        }}
                        onPointerDown={(e) => handlePointerDown(e, book.id)}
                        onPointerEnter={() => {
                          if (!draggingId) setHoveredBookId(book.id);
                        }}
                        onPointerLeave={() => {
                          if (!draggingId) setHoveredBookId(null);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (justDraggedRef.current) {
                            return;
                          }
                          setSelectedBook(book);
                        }}
                        title={`${book.title} by ${book.author} (Click to open, drag to move)`}
                      >
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={`Cover of ${book.title}`}
                            className={styles.pileBookCoverImg}
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className={styles.pileBookFallbackCover}>
                            <span className={styles.pileFallbackTitle}>{book.title}</span>
                            <span className={styles.pileFallbackAuthor}>{book.author}</span>
                          </div>
                        )}

                        <div className={styles.pileBookSpineHighlight} />
                      </div>
                    );
                  })}

                  {/* Floating Hover Card in Pile Mode */}
                  {viewMode === "pile" && hoveredBook && !draggingId && positions[hoveredBook.id] && (() => {
                    const pos = positions[hoveredBook.id];
                    const deskWidth = deskRef.current?.clientWidth || 780;
                    const deskHeight = deskRef.current?.clientHeight || 680;
                    const cardWidth = 350;
                    const cardHeight = 230;

                    // Place on right if space permits, else on left
                    const spaceOnRight = deskWidth - (pos.x + 154);
                    const cardLeft = spaceOnRight >= cardWidth + 16 ? pos.x + 164 : Math.max(12, pos.x - cardWidth - 10);
                    const cardTop = Math.max(12, Math.min(deskHeight - cardHeight - 12, pos.y));

                    return (
                      <div
                        className={styles.pileHoverCard}
                        style={{
                          left: `${cardLeft}px`,
                          top: `${cardTop}px`,
                        }}
                      >
                        <div className={styles.pileHoverCardBody}>
                          {/* Full Book Cover Thumbnail */}
                          <div className={styles.pileHoverCoverWrap}>
                            {hoveredBook.coverImage ? (
                              <img
                                src={hoveredBook.coverImage}
                                alt={`Cover of ${hoveredBook.title}`}
                                className={styles.pileHoverCoverImg}
                              />
                            ) : (
                              <div className={styles.pileBookFallbackCover}>
                                <span className={styles.pileFallbackTitle}>{hoveredBook.title}</span>
                              </div>
                            )}
                          </div>

                          {/* Info Column */}
                          <div className={styles.pileHoverInfoCol}>
                            <div className={styles.hoverCardHeader}>
                              {hoveredBook.genre && (
                                <span
                                  className={`${styles.genreTag} ${
                                    styles[`genre_${hoveredBook.genre.color}`] || styles.genre_default
                                  }`}
                                >
                                  {hoveredBook.genre.name}
                                </span>
                              )}
                              {hoveredBook.rating !== null && (
                                <span className={styles.hoverCardRatingPill}>
                                  ★ {hoveredBook.rating.toFixed(1)}
                                </span>
                              )}
                            </div>

                            <h4 className={styles.hoverCardTitle}>{hoveredBook.title}</h4>
                            <p className={styles.hoverCardAuthor}>by {hoveredBook.author}</p>

                            {hoveredBook.review ? (
                              <div className={styles.hoverCardReviewBox}>
                                <p className={styles.hoverCardReview}>“{hoveredBook.review}”</p>
                              </div>
                            ) : (
                              <p className={styles.hoverCardNoReview}>No review written in Notion yet.</p>
                            )}
                          </div>
                        </div>

                        <div className={styles.hoverCardFooter}>
                          <span className={styles.hoverCardHint}>Click book to open full window ↗</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TIDY VIEW: Neat Stack of Spines with Side Hover Box */}
              {viewMode === "tidy" && (
                <div className={styles.tidyStackWorkspace}>
                  <div className={styles.tidyStageLayout}>
                    {/* Left: Spacer to keep spine stack centered */}
                    <div className={styles.tidySideSpacer} aria-hidden="true" />

                    {/* Center: Tower of Spines */}
                    <div className={styles.tidyStackTableBase}>
                      <div className={styles.tidySpinesTower}>
                        {books.map((book, index) => {
                          const spineColor = getSpineColor(book, index);
                          const spineWidth = getSpineWidth(index);
                          const isHovered = hoveredBookId === book.id;

                          return (
                            <div
                              key={book.id}
                              className={`${styles.tidySpineItem} ${isHovered ? styles.tidySpineActive : ""}`}
                              style={{
                                backgroundColor: spineColor,
                                width: `${spineWidth}px`,
                              }}
                              onPointerEnter={() => setHoveredBookId(book.id)}
                              onPointerLeave={() => setHoveredBookId(null)}
                              onClick={() => setSelectedBook(book)}
                              title={`Click to open: ${book.title} by ${book.author}`}
                            >
                              <div className={styles.spineGrooveLeft} />
                              <div className={styles.spineGrooveRight} />

                              <span className={styles.tidySpineTitle}>{book.title}</span>

                              <div className={styles.tidySpineMeta}>
                                <span className={styles.tidySpineAuthor}>{book.author}</span>
                                {book.rating !== null && (
                                  <span className={styles.tidySpineRating}>
                                    {"★".repeat(Math.round(book.rating))}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Desk Surface Plank */}
                      <div className={styles.tidyWoodDeskPlank} />
                      <div className={styles.tidyDeskLegsRow}>
                        <div className={styles.tidyDeskLeg} />
                        <div className={styles.tidyDeskLeg} />
                      </div>
                    </div>

                    {/* Right: Side Inspector Box - Only Shows Up When Hovering */}
                    <div className={styles.tidySideColumn}>
                      {hoveredBook && (
                        <div className={styles.tidySideBox}>
                          <div className={styles.tidySideBoxHeader}>
                            <span className={styles.tidySideBoxBadge}>Hover Preview</span>
                            {hoveredBook.genre && (
                              <span
                                className={`${styles.genreTag} ${
                                  styles[`genre_${hoveredBook.genre.color}`] || styles.genre_default
                                }`}
                              >
                                {hoveredBook.genre.name}
                              </span>
                            )}
                          </div>

                          <div className={styles.tidySideCoverWrap}>
                            {hoveredBook.coverImage ? (
                              <img
                                src={hoveredBook.coverImage}
                                alt={`Cover of ${hoveredBook.title}`}
                                className={styles.tidySideCoverImg}
                              />
                            ) : (
                              <div className={styles.pileBookFallbackCover}>
                                <span className={styles.pileFallbackTitle}>{hoveredBook.title}</span>
                                <span className={styles.pileFallbackAuthor}>{hoveredBook.author}</span>
                              </div>
                            )}
                            <div className={styles.tidySideCoverSpineShadow} />
                          </div>

                          <h3 className={styles.tidySideTitle}>{hoveredBook.title}</h3>
                          <p className={styles.tidySideAuthor}>by {hoveredBook.author}</p>

                          <div className={styles.tidySideRatingRow}>
                            <span className={styles.tidySideStars}>
                              {"★".repeat(Math.round(hoveredBook.rating ?? 0)) +
                                "☆".repeat(Math.max(0, 5 - Math.round(hoveredBook.rating ?? 0)))}
                            </span>
                            <span className={styles.tidySideScore}>
                              {hoveredBook.rating !== null ? `${hoveredBook.rating.toFixed(1)} / 5.0` : "Unrated"}
                            </span>
                          </div>

                          <div className={styles.tidySideReviewBox}>
                            <div className={styles.tidySideReviewLabel}>Reader Notes:</div>
                            <p className={styles.tidySideReviewText}>
                              {hoveredBook.review ? `“${hoveredBook.review}”` : "No review written yet."}
                            </p>
                          </div>

                          <button
                            type="button"
                            className={styles.tidySideOpenBtn}
                            onClick={() => setSelectedBook(hoveredBook)}
                          >
                            Click to open full window ↗
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pop-up Window Modal with Book Open Animation */}
        {selectedBook && (
          <div
            className={styles.bookModalBackdrop}
            onClick={() => setSelectedBook(null)}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.bookModalCard} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={() => setSelectedBook(null)}
                aria-label="Close book details"
              >
                ✕
              </button>

              <div className={styles.modalLayout}>
                {/* Left Page: Book Cover */}
                <div className={styles.modalCoverWrap}>
                  {selectedBook.coverImage ? (
                    <img
                      src={selectedBook.coverImage}
                      alt={`Cover of ${selectedBook.title}`}
                      className={styles.modalCoverImage}
                    />
                  ) : (
                    <div className={styles.pileBookFallbackCover}>
                      <span className={styles.pileFallbackTitle}>{selectedBook.title}</span>
                      <span className={styles.pileFallbackAuthor}>{selectedBook.author}</span>
                    </div>
                  )}
                  <div className={styles.modalCoverSpineShadow} />
                </div>

                {/* Right Page: Book Info & Review */}
                <div className={styles.modalInfo}>
                  {selectedBook.genre && (
                    <div className={styles.modalGenreRow}>
                      <span
                        className={`${styles.genreTag} ${
                          styles[`genre_${selectedBook.genre.color}`] || styles.genre_default
                        }`}
                      >
                        {selectedBook.genre.name}
                      </span>
                    </div>
                  )}

                  <h2 className={styles.modalTitle}>{selectedBook.title}</h2>
                  <p className={styles.modalAuthor}>by {selectedBook.author}</p>

                  <div className={styles.modalRatingBox}>
                    <span className={styles.modalRatingStars}>
                      {"★".repeat(Math.round(selectedBook.rating ?? 0)) +
                        "☆".repeat(Math.max(0, 5 - Math.round(selectedBook.rating ?? 0)))}
                    </span>
                    <span className={styles.modalRatingScore}>
                      {selectedBook.rating !== null ? `${selectedBook.rating.toFixed(1)} / 5.0` : "Unrated"}
                    </span>
                  </div>

                  <h3 className={styles.modalReviewHeading}>Reader Review &amp; Notes</h3>
                  <div className={styles.modalReviewText}>
                    {selectedBook.review ? `“${selectedBook.review}”` : "No review written in Notion yet."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notion Credentials Setup Modal */}
      {showSetupModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowSetupModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.setupModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalCloseButton}
              onClick={() => setShowSetupModal(false)}
              aria-label="Close setup modal"
            >
              ✕
            </button>

            <h2 className={styles.setupModalTitle}>Notion Integration Setup</h2>
            <p className={styles.setupModalSub}>
              Connect your Notion database to power this bookshelf tracker. You can enter your credentials below to test immediately, or add them to <span className={styles.codeInline}>.env.local</span>.
            </p>

            <div className={styles.credentialCard}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="notion-api-key">
                  Notion API Key / Internal Integration Token
                </label>
                <input
                  id="notion-api-key"
                  type="password"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  placeholder="ntn_... or secret_..."
                  className={styles.fieldInput}
                />
                <p className={styles.fieldHint}>
                  From <a href="https://www.notion.so/profile/integrations" target="_blank" rel="noopener noreferrer">notion.so/profile/integrations</a>
                </p>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="notion-db-id">
                  Notion Database ID or URL
                </label>
                <input
                  id="notion-db-id"
                  type="text"
                  value={inputDbId}
                  onChange={(e) => setInputDbId(e.target.value)}
                  placeholder="https://notion.so/{workspace}/{database_id}?v=... or 32-char ID"
                  className={styles.fieldInput}
                />
                <p className={styles.fieldHint}>
                  Paste the URL of your Notion database; we automatically extract the 32-character ID.
                </p>
              </div>

              <div className={styles.setupActionRow}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleSaveCredentials}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting to Notion..." : "Connect & Save"}
                </button>

                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClearCredentials}
                >
                  Reset to Demo Data
                </button>
              </div>

              {connectMessage && (
                <div className={connectMessage.isError ? styles.alertBoxError : styles.alertBox}>
                  {connectMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}