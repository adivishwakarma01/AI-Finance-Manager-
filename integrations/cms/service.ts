import { WixDataItem, WixDataQueryResult } from ".";

// Simple client-side persistence using localStorage with an in-memory fallback for non-browser environments
const STORAGE_PREFIX = "mint-ai-cms:";
const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const memoryStore: Record<string, WixDataItem[]> = {};

function readCollection<T extends WixDataItem>(collectionId: string): T[] {
  if (isBrowser) {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + collectionId);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch (e) {
      console.warn("Failed to read from localStorage:", e);
      return [];
    }
  }
  return (memoryStore[collectionId] || []) as T[];
}

function writeCollection<T extends WixDataItem>(collectionId: string, items: T[]): void {
  if (isBrowser) {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + collectionId, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to write to localStorage:", e);
    }
    return;
  }
  memoryStore[collectionId] = items as WixDataItem[];
}

function generateId(): string {
  const hasCrypto = typeof globalThis !== "undefined" && (globalThis as any).crypto && typeof (globalThis as any).crypto.randomUUID === "function";
  if (hasCrypto) {
    return (globalThis as any).crypto.randomUUID();
  }
  // Fallback: simple unique id
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Generic CRUD Service class for data collections
 * TODO: Replace with your own backend (API/database) when available.
 */
export class BaseCrudService {
  /**
   * Creates a new item in the collection
   * @param itemData - Data for the new item
   * @returns Promise<T> - The created item
   */
  static async create<T extends WixDataItem>(collectionId: string, itemData: T): Promise<T> {
    const items = readCollection<T>(collectionId);
    const now = new Date();

    const newItem: T = {
      ...itemData,
      _id: itemData._id || generateId(),
      _createdDate: itemData._createdDate || now,
      _updatedDate: now,
    };

    items.push(newItem);
    writeCollection(collectionId, items);
    return newItem;
  }

  /**
   * Retrieves all items from the collection
   * @param collectionId - The collection to query
   * @param includeReferencedItems - Array of reference field names to populate (unused in local mode)
   * @returns Promise<WixDataQueryResult<T>> - Query result with all items
   */
  static async getAll<T extends WixDataItem>(
    collectionId: string,
    includeReferencedItems?: string[]
  ): Promise<WixDataQueryResult<T>> {
    const items = readCollection<T>(collectionId);
    return {
      items,
      totalCount: items.length,
      hasNext: false,
      hasPrev: false,
    };
  }

  /**
   * Retrieves a single item by ID
   * @param collectionId - The collection to query
   * @param itemId - ID of the item to retrieve
   * @param includeReferencedItems - Array of reference field names to populate (unused in local mode)
   * @returns Promise<T | null> - The item or null if not found
   */
  static async getById<T extends WixDataItem>(
    collectionId: string,
    itemId: string,
    includeReferencedItems?: string[]
  ): Promise<T | null> {
    const items = readCollection<T>(collectionId);
    const found = items.find((it) => it._id === itemId) || null;
    return found ?? null;
  }

  /**
   * Updates an existing item
   * @param itemData - Updated item data (must include _id)
   * @returns Promise<T> - The updated item
   */
  static async update<T extends WixDataItem>(collectionId: string, itemData: T): Promise<T> {
    if (!itemData._id) {
      throw new Error("update() requires itemData with _id");
    }

    const items = readCollection<T>(collectionId);
    const idx = items.findIndex((it) => it._id === itemData._id);
    if (idx === -1) {
      throw new Error(`Item with id ${itemData._id} not found in ${collectionId}`);
    }

    const now = new Date();
    const updated: T = {
      ...items[idx],
      ...itemData,
      _updatedDate: now,
    };

    items[idx] = updated;
    writeCollection(collectionId, items);
    return updated;
  }

  /**
   * Deletes an item by ID
   * @param itemId - ID of the item to delete
   * @returns Promise<T> - The deleted item
   */
  static async delete<T extends WixDataItem>(collectionId: string, itemId: string): Promise<T> {
    const items = readCollection<T>(collectionId);
    const idx = items.findIndex((it) => it._id === itemId);
    if (idx === -1) {
      throw new Error(`Item with id ${itemId} not found in ${collectionId}`);
    }

    const [deleted] = items.splice(idx, 1);
    writeCollection(collectionId, items);
    return deleted;
  }
}
