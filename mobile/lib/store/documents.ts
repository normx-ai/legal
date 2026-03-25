import { create } from "zustand";
import type { DocumentItem } from "../api/documents";

interface DocumentsState {
  documents: DocumentItem[];
  isLoading: boolean;
  setDocuments: (docs: DocumentItem[]) => void;
  addDocument: (doc: DocumentItem) => void;
  setLoading: (loading: boolean) => void;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  documents: [],
  isLoading: false,
  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
  setLoading: (isLoading) => set({ isLoading }),
}));
