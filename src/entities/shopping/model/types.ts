export type ShoppingItem = {
  id: string;
  listId: string;
  name: string;
  quantity?: string | null;
  checked: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type ShoppingList = {
  id: string;
  familyId: string;
  name: string;
  archived: boolean;
  version: number;
  items: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
};
