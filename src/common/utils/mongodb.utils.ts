import { Types } from 'mongoose';

/**
 * Safely converts a value to a MongoDB ObjectId
 * @param id The value to convert to ObjectId
 * @returns ObjectId or null if conversion fails
 */
export function toObjectId(id: any): Types.ObjectId | null {
  if (!id) return null;
  try {
    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  } catch (error) {
    return null;
  }
}

/**
 * Safely converts a MongoDB ObjectId to string
 * @param id The ObjectId to convert to string
 * @returns String representation of ObjectId or null if conversion fails
 */
export function toString(id: any): string | null {
  if (!id) return null;
  try {
    return id.toString();
  } catch (error) {
    return null;
  }
}
