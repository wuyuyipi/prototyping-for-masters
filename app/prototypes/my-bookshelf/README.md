# My Bookshelf (Notion API Reading Tracker)

A tactile, interactive reading tracker and personal literary archive prototype built with **Next.js**, **React**, and the **official Notion API SDK (`@notionhq/client`)**.

Instead of a generic static grid, this prototype reimagines your reading log as physical books on your desk:

- **🔀 Pile Mode**: Books are scattered organically across a desk mat with natural rotations. You can click and drag books around freely to reorganize your desk, bring favorite books to the top, or click **"🎲 Toss & Scatter"** to reshuffle. Hovering over any book in the pile immediately reveals its detailed review and metadata in the side inspector box.
- **📚 Tidy Mode**: Books neatly transform into an orderly vertical stack of horizontal spines resting on a study desk. Hovering over any spine pulls it out horizontally from the stack and instantly populates the detailed info box on the side.
- **Side Inspector Box**: A dedicated reading panel displaying the book's high-resolution cover (with 3D spine and paper shadow), title, author, Notion-colored genre badge, star rating, full reader review notes, and a direct link to open the page in Notion.

---

## Notion Database Schema

Your Notion database uses these 6 properties:

| Property Name | Notion Property Type | Description / Example |
| :--- | :--- | :--- |
| **Title** | `Title` | Name of the book (e.g. *Yellowface*, *Exhalation*) |
| **Author** | `Rich Text` or `Select` | Author name (e.g. *R.F. Kuang*, *Ted Chiang*) |
| **Genre** | `Select` (Single select) | Category tag with Notion color (e.g. *fiction*, *science fiction*) |
| **Cover Image** | `Files & media` or `URL` | Book cover image file, external URL, or page cover |
| **Rating** | `Number` | Rating score from 1 to 5 (e.g. `5`, `4`, `3`) |
| **Review** | `Rich Text` | Your personal review, notes, or key takeaways |

---

## Setup & Configuration

Configure your Notion credentials in `.env.local` or directly within the prototype's user interface:

### In `.env.local`
```bash
NOTION_API_KEY=ntn_your_integration_token_here
NOTION_DATABASE_ID=your_32_character_database_id_here
```

### In-Browser Testing
1. Click the **"Notion Setup" ⚙️** button in the top navigation.
2. Paste your Notion API token and your database URL or ID.
3. Click **"Connect & Save"** to test and view your live books immediately.
