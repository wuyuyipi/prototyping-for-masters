"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Board, Item } from "../types";
import {
  createItemAction,
  updateItemAction,
  deleteItemAction,
  updateBoardAction,
  deleteBoardAction,
} from "../actions";
import styles from "../styles.module.css";

interface BoardDetailClientProps {
  board: Board;
  initialItems: Item[];
  isOwner: boolean;
}

export function BoardDetailClient({
  board: initialBoard,
  initialItems,
  isOwner,
}: BoardDetailClientProps) {
  const router = useRouter();
  const [board, setBoard] = useState<Board>(initialBoard);
  const [items, setItems] = useState<Item[]>(initialItems);

  // Add Item Modal state
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [itemTitle, setItemTitle] = useState("");
  const [imageSourceType, setImageSourceType] = useState<"upload" | "url">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [note, setNote] = useState("");
  const [itemLoading, setItemLoading] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);

  // Edit Board Modal state
  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(board.title);
  const [editDescription, setEditDescription] = useState(board.description || "");
  const [editIsPublic, setEditIsPublic] = useState(board.is_public);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);

  // Inspo Detail Modal & Edit Item state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isEditingSelectedItem, setIsEditingSelectedItem] = useState(false);
  const [editItemTitle, setEditItemTitle] = useState("");
  const [editItemNote, setEditItemNote] = useState("");
  const [editItemLinkUrl, setEditItemLinkUrl] = useState("");
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [editItemError, setEditItemError] = useState<string | null>(null);

  // Helper to extract clean domain name from link
  const getDomainFromUrl = (url: string) => {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return "link";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setItemError("Image exceeds 10MB limit. Please select a smaller file.");
      return;
    }

    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    setSelectedFile(file);
    setFilePreviewUrl(URL.createObjectURL(file));
    setItemError(null);

    // Auto-fill title from filename if title is blank
    if (!itemTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setItemTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleRemoveFile = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
  };

  const closeAddItemModal = () => {
    setIsAddItemOpen(false);
    setItemError(null);
    handleRemoveFile();
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) return;

    setItemLoading(true);
    setItemError(null);

    const formData = new FormData();
    formData.append("title", itemTitle.trim());

    if (imageSourceType === "upload" && selectedFile) {
      formData.append("image_file", selectedFile);
    } else if (imageSourceType === "url" && imageUrl.trim()) {
      formData.append("image_url", imageUrl.trim());
    }

    formData.append("link_url", linkUrl.trim());
    formData.append("note", note.trim());

    const result = await createItemAction(board.id, formData);

    if (!result.success || !result.item) {
      setItemError(result.error || "Failed to add item.");
      setItemLoading(false);
      return;
    }

    setItems([result.item, ...items]);
    setItemTitle("");
    setImageUrl("");
    setLinkUrl("");
    setNote("");
    handleRemoveFile();
    setIsAddItemOpen(false);
    setItemLoading(false);
    router.refresh();
  };

  const handleDeleteItem = async (itemId: string, title: string) => {
    if (!confirm(`Delete item "${title}"?`)) return;

    const result = await deleteItemAction(itemId, board.id);
    if (result.success) {
      setItems(items.filter((i) => i.id !== itemId));
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
        setIsEditingSelectedItem(false);
      }
      router.refresh();
    } else {
      alert(result.error || "Could not delete item.");
    }
  };

  const handleOpenDetail = (item: Item) => {
    setSelectedItem(item);
    setIsEditingSelectedItem(false);
    setEditItemTitle(item.title);
    setEditItemNote(item.note || "");
    setEditItemLinkUrl(item.link_url || "");
    setEditItemError(null);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
    setIsEditingSelectedItem(false);
    setEditItemError(null);
  };

  const handleStartEdit = () => {
    if (!selectedItem) return;
    setEditItemTitle(selectedItem.title);
    setEditItemNote(selectedItem.note || "");
    setEditItemLinkUrl(selectedItem.link_url || "");
    setEditItemError(null);
    setIsEditingSelectedItem(true);
  };

  const handleSaveItemEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!editItemTitle.trim()) {
      setEditItemError("Name is required.");
      return;
    }

    setIsSavingItem(true);
    setEditItemError(null);

    const formData = new FormData();
    formData.append("title", editItemTitle.trim());
    formData.append("note", editItemNote.trim());
    formData.append("link_url", editItemLinkUrl.trim());

    const result = await updateItemAction(selectedItem.id, board.id, formData);

    if (!result.success || !result.item) {
      setEditItemError(result.error || "Failed to save changes.");
      setIsSavingItem(false);
      return;
    }

    const updated = result.item;
    setSelectedItem(updated);
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setIsEditingSelectedItem(false);
    setIsSavingItem(false);
    router.refresh();
  };

  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setBoardLoading(true);
    setBoardError(null);

    const formData = new FormData();
    formData.append("title", editTitle.trim());
    formData.append("description", editDescription.trim());
    formData.append("is_public", editIsPublic ? "true" : "false");

    const result = await updateBoardAction(board.id, formData);

    if (!result.success) {
      setBoardError(result.error || "Failed to update board.");
      setBoardLoading(false);
      return;
    }

    setBoard({
      ...board,
      title: editTitle.trim(),
      description: editDescription.trim() || null,
      is_public: editIsPublic,
    });
    setIsEditBoardOpen(false);
    setBoardLoading(false);
    router.refresh();
  };

  const handleDeleteBoard = async () => {
    if (!confirm(`Are you sure you want to delete board "${board.title}" and all its items?`)) {
      return;
    }

    const result = await deleteBoardAction(board.id);
    if (result.success) {
      router.push("/prototypes/inspiration-library");
      router.refresh();
    } else {
      alert(result.error || "Could not delete board.");
    }
  };

  return (
    <div>
      {/* Board Header Section */}
      <div className={styles.boardHeaderSection}>
        <div className={styles.boardBreadcrumbs}>
          <Link href="/prototypes/inspiration-library" className={styles.boardBreadcrumbLink}>
            Inspiration Library
          </Link>
          <span className={styles.boardBreadcrumbSeparator}>/</span>
          <span className={styles.boardBreadcrumbCurrent}>{board.title}</span>
        </div>

        <div className={styles.boardHeaderMain}>
          <div className={styles.boardTitleGroup}>
            <div className={styles.boardMetaRow}>
              <span
                className={
                  board.is_public
                    ? styles.privacyBadgePublic
                    : styles.privacyBadgePrivate
                }
              >
                {board.is_public ? "● Public Board" : "🔒 Private Board"}
              </span>

              {board.owner_name && (
                <span className={styles.boardOwnerTag}>
                  Curated by <strong>{board.owner_name}</strong>
                </span>
              )}

              <span className={styles.itemCountBadge}>
                {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
              </span>
            </div>

            <h1 className={styles.boardHeading}>{board.title}</h1>

            {board.description && (
              <p className={styles.boardDescriptionText}>{board.description}</p>
            )}
          </div>

          {/* Owner Controls */}
          {isOwner && (
            <div className={styles.boardControls}>
              <button
                onClick={() => setIsAddItemOpen(true)}
                className={styles.createButton}
                type="button"
              >
                <span>+</span>
                <span>Add Item</span>
              </button>

              <button
                onClick={() => setIsEditBoardOpen(true)}
                className={styles.authButtonSecondary}
                type="button"
              >
                Edit Board
              </button>

              <button
                onClick={handleDeleteBoard}
                className={styles.authButtonSecondary}
                type="button"
                style={{ color: "#DC2626" }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Masonry Grid */}
      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyStateTitle}>This board is empty</h3>
          <p className={styles.emptyStateText}>
            {isOwner
              ? "Start collecting visual references, typography inspirations, and links by clicking 'Add Item'."
              : "No items have been added to this board yet."}
          </p>
          {isOwner && (
            <button
              onClick={() => setIsAddItemOpen(true)}
              className={styles.createButton}
              type="button"
            >
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className={styles.masonryGrid}>
          {items.map((item) => {
            const hasLink = Boolean(item.link_url && item.link_url.trim().length > 0);
            const externalHref = hasLink
              ? item.link_url!.startsWith("http")
                ? item.link_url!
                : `https://${item.link_url!}`
              : null;

            return (
              <article
                key={item.id}
                className={styles.masonryItem}
                onClick={() => handleOpenDetail(item)}
              >
                {item.image_url && (
                  <div className={styles.itemImageWrapper}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        item.image_url.startsWith("http://") ||
                        item.image_url.startsWith("https://") ||
                        item.image_url.startsWith("data:")
                          ? item.image_url
                          : `/api/inspiration-library/image?path=${encodeURIComponent(item.image_url)}`
                      }
                      alt={item.title}
                      loading="lazy"
                      className={styles.itemImage}
                      onError={(e) => {
                        // Fallback on broken image link
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className={styles.itemContent}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>

                  {item.note && <p className={styles.itemNote}>{item.note}</p>}

                  {(hasLink || isOwner) && (
                    <div className={styles.itemFooter}>
                      {hasLink && externalHref ? (
                        <a
                          href={externalHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.itemExternalLink}
                          title={`Open ${externalHref}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{getDomainFromUrl(item.link_url!)}</span>
                          <span>↗</span>
                        </a>
                      ) : (
                        <span />
                      )}

                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id, item.title);
                          }}
                          className={styles.itemDeleteButton}
                          type="button"
                          title="Delete item"
                          aria-label={`Delete item ${item.title}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add Item Modal (Owner Only) */}
      {isOwner && isAddItemOpen && (
        <div className={styles.modalBackdrop} onClick={closeAddItemModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalHeading}>Add Item to Board</h3>
              <button
                onClick={closeAddItemModal}
                className={styles.modalCloseButton}
                type="button"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {itemError && <div className={styles.formErrorMessage}>{itemError}</div>}

            <form onSubmit={handleAddItem}>
              <div className={styles.formFieldGroup}>
                <label className={styles.formLabel} htmlFor="item-title">
                  Title *
                </label>
                <input
                  id="item-title"
                  type="text"
                  required
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="e.g. Neue Haas Grotesk Specimen"
                  className={styles.formInput}
                  autoFocus
                />
              </div>

              {/* Image Source Selection */}
              <div className={styles.formFieldGroup}>
                <label className={styles.formLabel}>Image Source</label>
                <div className={styles.sourceToggle}>
                  <button
                    type="button"
                    className={
                      imageSourceType === "upload"
                        ? `${styles.sourceToggleBtn} ${styles.sourceToggleBtnActive}`
                        : styles.sourceToggleBtn
                    }
                    onClick={() => setImageSourceType("upload")}
                  >
                    📁 Upload from Computer
                  </button>
                  <button
                    type="button"
                    className={
                      imageSourceType === "url"
                        ? `${styles.sourceToggleBtn} ${styles.sourceToggleBtnActive}`
                        : styles.sourceToggleBtn
                    }
                    onClick={() => setImageSourceType("url")}
                  >
                    🔗 Image URL
                  </button>
                </div>

                {imageSourceType === "upload" ? (
                  <div>
                    {!selectedFile ? (
                      <label className={styles.fileUploadDropzone} htmlFor="item-file-input">
                        <span className={styles.fileUploadIcon}>🖼️</span>
                        <p className={styles.fileUploadPrompt}>
                          Click or drag & drop an image from your computer
                        </p>
                        <span className={styles.fileUploadHint}>
                          JPG, PNG, GIF, WEBP, SVG • Max 10MB
                        </span>
                        <input
                          id="item-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className={styles.fileInputHidden}
                        />
                      </label>
                    ) : (
                      <div className={styles.previewContainer}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={filePreviewUrl || ""}
                          alt="Selected file preview"
                          className={styles.previewImage}
                        />
                        <div className={styles.previewFileInfo}>
                          <span className={styles.previewFileName}>
                            📄 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className={styles.previewRemoveButton}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      id="item-image-url"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className={styles.formInput}
                    />
                    {imageUrl && (
                      <div className={styles.imagePreviewBox}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt="Thumbnail preview"
                          className={styles.imagePreviewThumb}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.formFieldGroup}>
                <label className={styles.formLabel} htmlFor="item-link-url">
                  Link / Source URL
                </label>
                <input
                  id="item-link-url"
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://are.na/block/..."
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formFieldGroup}>
                <label className={styles.formLabel} htmlFor="item-note">
                  Note / Thoughts
                </label>
                <textarea
                  id="item-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Personal observations, design details, typographic notes..."
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formActionRow}>
                <button
                  type="button"
                  onClick={closeAddItemModal}
                  className={styles.formCancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={itemLoading}
                  className={styles.formSubmitButton}
                >
                  {itemLoading ? "Uploading & Saving..." : "Add to Board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Board Modal (Owner Only) */}
      {isOwner && isEditBoardOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsEditBoardOpen(false)}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalHeading}>Edit Board</h3>
              <button
                onClick={() => setIsEditBoardOpen(false)}
                className={styles.modalCloseButton}
                type="button"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {boardError && <div className={styles.formErrorMessage}>{boardError}</div>}

            <form onSubmit={handleUpdateBoard}>
              <div className={styles.formFieldGroup}>
                <label className={styles.formLabel} htmlFor="edit-title">
                  Board Title *
                </label>
                <input
                  id="edit-title"
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formFieldGroup}>
                <label className={styles.formLabel} htmlFor="edit-desc">
                  Description
                </label>
                <textarea
                  id="edit-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className={styles.formTextarea}
                />
              </div>

              <label className={styles.formCheckboxGroup}>
                <input
                  type="checkbox"
                  checked={editIsPublic}
                  onChange={(e) => setEditIsPublic(e.target.checked)}
                  className={styles.formCheckbox}
                />
                <span className={styles.formCheckboxLabel}>
                  Make this board public (anyone with the link can view it)
                </span>
              </label>

              <div className={styles.formActionRow}>
                <button
                  type="button"
                  onClick={() => setIsEditBoardOpen(false)}
                  className={styles.formCancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={boardLoading}
                  className={styles.formSubmitButton}
                >
                  {boardLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspo Detail & Inline Edit Modal */}
      {selectedItem && (
        <div className={styles.detailBackdrop} onClick={handleCloseDetail}>
          <div
            className={styles.detailCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className={styles.detailHeaderBar}>
              <span className={styles.detailHeaderBadge}>
                {board.title} / Inspiration Detail
              </span>
              <button
                onClick={handleCloseDetail}
                className={styles.detailCloseButton}
                type="button"
                aria-label="Close detail modal"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.detailBody}>
              {/* Image Pane */}
              <div className={styles.detailMediaCol}>
                {selectedItem.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      selectedItem.image_url.startsWith("http://") ||
                      selectedItem.image_url.startsWith("https://") ||
                      selectedItem.image_url.startsWith("data:")
                        ? selectedItem.image_url
                        : `/api/inspiration-library/image?path=${encodeURIComponent(
                            selectedItem.image_url
                          )}`
                    }
                    alt={selectedItem.title}
                    className={styles.detailImage}
                  />
                ) : (
                  <div className={styles.detailImagePlaceholder}>
                    No Image Attached
                  </div>
                )}
              </div>

              {/* Info & Edit Pane */}
              <div className={styles.detailInfoCol}>
                {!isEditingSelectedItem ? (
                  <>
                    <div className={styles.detailInfoTop}>
                      {/* Name / Title */}
                      <div className={styles.detailFieldBlock}>
                        <div className={styles.detailFieldHeader}>
                          <span className={styles.detailFieldLabel}>Name</span>
                          {isOwner && (
                            <button
                              type="button"
                              onClick={handleStartEdit}
                              className={styles.inlineEditButton}
                              title="Edit name and description"
                            >
                              <span>✎</span>
                              <span>Edit</span>
                            </button>
                          )}
                        </div>
                        <h2 className={styles.detailTitle}>{selectedItem.title}</h2>
                      </div>

                      {/* Description / Note */}
                      <div className={styles.detailFieldBlock}>
                        <div className={styles.detailFieldHeader}>
                          <span className={styles.detailFieldLabel}>
                            Description / Notes
                          </span>
                          {isOwner && (
                            <button
                              type="button"
                              onClick={handleStartEdit}
                              className={styles.inlineEditButton}
                              title="Edit description"
                            >
                              <span>✎</span>
                              <span>Edit</span>
                            </button>
                          )}
                        </div>
                        {selectedItem.note ? (
                          <p className={styles.detailDescription}>
                            {selectedItem.note}
                          </p>
                        ) : (
                          <p className={styles.detailEmptyNote}>
                            {isOwner
                              ? "No description yet. Click 'Edit' to add notes or thoughts."
                              : "No description provided."}
                          </p>
                        )}
                      </div>

                      {/* Source Link */}
                      {selectedItem.link_url && (
                        <div className={styles.detailFieldBlock}>
                          <span className={styles.detailFieldLabel}>
                            Source Link
                          </span>
                          <a
                            href={
                              selectedItem.link_url.startsWith("http")
                                ? selectedItem.link_url
                                : `https://${selectedItem.link_url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.detailLinkBox}
                          >
                            <span>{getDomainFromUrl(selectedItem.link_url)}</span>
                            <span>↗</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Footer Row */}
                    <div className={styles.detailFooterRow}>
                      <span className={styles.detailDateBadge}>
                        Added{" "}
                        {new Date(selectedItem.created_at).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>

                      {isOwner && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteItem(selectedItem.id, selectedItem.title)
                          }
                          className={styles.detailDeleteButton}
                        >
                          Delete this inspo
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  /* Edit Mode Form */
                  <form
                    onSubmit={handleSaveItemEdit}
                    className={styles.detailEditForm}
                  >
                    {editItemError && (
                      <div className={styles.formErrorMessage}>
                        {editItemError}
                      </div>
                    )}

                    <div className={styles.formFieldGroup}>
                      <label
                        className={styles.formLabel}
                        htmlFor="edit-inspo-title"
                      >
                        Name *
                      </label>
                      <input
                        id="edit-inspo-title"
                        type="text"
                        required
                        value={editItemTitle}
                        onChange={(e) => setEditItemTitle(e.target.value)}
                        className={styles.formInput}
                        autoFocus
                      />
                    </div>

                    <div className={styles.formFieldGroup}>
                      <label
                        className={styles.formLabel}
                        htmlFor="edit-inspo-note"
                      >
                        Description / Notes
                      </label>
                      <textarea
                        id="edit-inspo-note"
                        rows={6}
                        value={editItemNote}
                        onChange={(e) => setEditItemNote(e.target.value)}
                        placeholder="Personal observations, design details, typographic notes..."
                        className={styles.formTextarea}
                      />
                    </div>

                    <div className={styles.formFieldGroup}>
                      <label
                        className={styles.formLabel}
                        htmlFor="edit-inspo-link"
                      >
                        Source Link URL
                      </label>
                      <input
                        id="edit-inspo-link"
                        type="url"
                        value={editItemLinkUrl}
                        onChange={(e) => setEditItemLinkUrl(e.target.value)}
                        placeholder="https://are.na/block/..."
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.detailEditActions}>
                      <button
                        type="button"
                        onClick={() => setIsEditingSelectedItem(false)}
                        className={styles.formCancelButton}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingItem}
                        className={styles.formSubmitButton}
                      >
                        {isSavingItem ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
