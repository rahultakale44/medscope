import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  timeout: 120000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "Something went wrong while connecting to MedScope.";

    return Promise.reject(new Error(message));
  }
);

// Health endpoints
export const getHealth = () => api.get("/health");

export const getEmbeddingHealth = () => api.get("/health/embedding");

export const getQdrantHealth = () => api.get("/health/qdrant");

export const initializeQdrant = () => api.post("/health/qdrant/initialize");

// Document endpoints
export const uploadDocument = (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

export const listDocuments = () => api.get("/documents");

export const deleteDocument = (fileHash) => api.delete(`/documents/${fileHash}`);

// RAG endpoints
export const retrieveContext = (payload) => api.post("/chat/retrieve", payload);

export const queryMedical = (payload) => api.post("/chat/query", payload);

export default api;
