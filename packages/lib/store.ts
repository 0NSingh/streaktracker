import { atom } from "jotai";

export type User = {
  id: string;
  email: string;
  name: string | null;
};

export const userAtom = atom<User | null>(null);
export const authLoadingAtom = atom(true);
