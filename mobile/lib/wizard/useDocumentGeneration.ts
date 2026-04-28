import { useState, useCallback } from "react";
import { Platform } from "react-native";
import { documentsApi } from "@/lib/api/documents";
import { useDocumentsStore } from "@/lib/store/documents";

interface ApiError {
  response?: {
    data?: {
      errors?: { message: string }[];
      error?: string;
    };
  };
}

function extractErrorMessage(err: unknown): string {
  const e = err as ApiError;
  const errors = e.response?.data?.errors;
  if (errors && Array.isArray(errors)) {
    return errors.map((x) => x.message).join("\n");
  }
  return e.response?.data?.error || "Erreur lors de la génération";
}

export function useDocumentGeneration<T>(endpoint: string, onSuccess?: () => void) {
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const generate = useCallback(async (payload: T) => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate<T>(endpoint, payload);
      addDocument(data.document);
      setGeneratedUrl(data.docx_url);
      onSuccess?.();
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  }, [endpoint, addDocument, onSuccess]);

  const download = useCallback(() => {
    if (generatedUrl && Platform.OS === "web") {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3004";
      window.open(`${baseUrl.replace(/\/api$/, "")}${generatedUrl}`, "_blank");
    }
  }, [generatedUrl]);

  const reset = useCallback(() => {
    setGeneratedUrl(null);
    setError("");
  }, []);

  return { isGenerating, generatedUrl, error, generate, download, reset };
}
