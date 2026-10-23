"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Board } from "../types";
import { createBoardAction, deleteBoardAction } from "../actions";
import styles from "../styles.module.css";

interface BoardListClientProps {
  initialBoards: Board[];
}

export function BoardListClient({ initialBoards }: BoardListClientProps) {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("is_public", isPublic ? "true" : "false");

    const result = await createBoardAction(formData);

    if (!result.success || !result.board) {
      setError(result.error || "Failed to create board.");
      setLoading(false);
      return;
    }

    setBoards([result.board, ...boards]);
    setTitle("");
    setDescription("");
    setIsPublic(false);
    setIsModalOpen(false);
    setLoading(false);
    router.refresh();
  };

  const handleDeleteBoard = async (boardId: string, boardTitle: string) => {
    if (!confirm(`Are you sure you want to delete board "${boardTitle}" and all its saved items?`)) {
      return;
    }

    const result = await deleteBoardAction(boardId);
    if (result.success) {
      setBoards(boards.filter((b) => b.id !== boardId));
      router.refresh();
    } else {
      alert(result.error || "Could not delete board.");
    }
  };

  return (
    <>
      <div className={styles.dashboardHeader}>
        <div className={styles.dashboardTitleGroup}>
          <h2 className={styles.dashboardHeading}>My Inspiration Boards</h2>
          <p className={styles.dashboardSubtitle}>
            {boards.length} {boards.length === 1 ? "BOARD" : "BOARDS"} IN ARCHIVE
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={styles.createButton}
          type="button"
        >
          <span>+</span>
          <span>New Board</span>
        </button>
      </div>

      {boards.length === 0 ? (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyStateTitle}>No boards yet</h3>
          <p className={styles.emptyStateText}>
            Create your first board to start collecting imagery, references, and bookmarks.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className={styles.createButton}
            type="button"
          >
            Create First Board
          </button>
        </div>
      ) : (
        <div className={styles.boardsGrid}>
          {boards.map((board) => (
            <div key={board.id} className={styles.boardCard}>
              <div>
                <div className={styles.boardCardHeader}>
                  <span
                    className={
                      board.is_public
                        ? styles.privacyBadgePublic
                        : styles.privacyBadgePrivate
                    }
                  >
                    {board.is_public ? "● Public" : "🔒 Private"}
                  </span>
                  <span className={styles.itemCountBadge}>
                    {board.item_count || 0} {board.item_count === 1 ? "item" : "items"}
                  </span>
                </div>

                <Link
                  href={`/prototypes/inspiration-library/boards/${board.id}`}
                  className={styles.boardCardTitle}
                >
                  {board.title}
                </Link>

                <p className={styles.boardCardDesc}>
                  {board.description || "No description provided."}
                </p>
              </div>

              <div className={styles.boardCardFooter}>
                <Link
                  href={`/prototypes/inspiration-library/boards/${board.id}`}
                  className={styles.boardOpenLink}
                >
                  <span>Open Board</span>
                  <span>↗</span>
                </Link>

                <button
                  onClick={() => handleDeleteBoard(board.id, board.title)}
                  className={styles.boardDeleteButton}
                  type="button"
                  title="Delete board"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Board Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsModalOpen(false)}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalHeading}>Create New Board</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.modalCloseButton}
                type="button"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {error && <div className={styles.formErrorMessage}>{error}</div>}

            <form onSubmit={handleCreateBoard}>
              <div className={styles.formFieldGroup}>
                <label className={styles.formLabel} htmlFor="board-title">
                  Board Title *
                </label>
                <input
                  id="board-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Brutalist Typography, Industrial Design"
                  className={styles.formInput}
                  autoFocus
                />
              </div>

              <div className={styles.formFieldGroup}>
                <label className={styles.formLabel} htmlFor="board-desc">
                  Description
                </label>
                <textarea
                  id="board-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What inspirations belong in this channel?"
                  className={styles.formTextarea}
                />
              </div>

              <label className={styles.formCheckboxGroup}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className={styles.formCheckbox}
                />
                <span className={styles.formCheckboxLabel}>
                  Make this board public (anyone with the link can view it)
                </span>
              </label>

              <div className={styles.formActionRow}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.formCancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.formSubmitButton}
                >
                  {loading ? "Creating..." : "Create Board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
