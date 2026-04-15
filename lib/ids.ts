import { customAlphabet } from 'nanoid';

// URL-safe alphabet, 8 chars → ~47 bits of entropy — plenty for a local JSON store
const nano = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8);

export const newFragmentId = (): string => `frg_${nano()}`;
export const newResponseId = (): string => `rsp_${nano()}`;
