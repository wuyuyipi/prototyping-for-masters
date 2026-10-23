export interface Board {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  item_count?: number;
  owner_name?: string | null;
}

export interface Item {
  id: string;
  board_id: string;
  user_id: string;
  image_url: string | null;
  link_url: string | null;
  title: string;
  note: string | null;
  created_at: string;
}

export interface BoardWithItems {
  board: Board;
  items: Item[];
  isOwner: boolean;
}
