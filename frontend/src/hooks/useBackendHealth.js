import { useState, useEffect, useCallback } from "react";
import { getHealth, getEmbeddingHealth, getQdrantHealth } from "../services/api";

export function useBackendHealth() {
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState({
    api: { status: "unknown", healthy: false },
    embedding: { status: "unknown", healthy: false, model: null, dimension: null },
    qdrant: { status: "unknown", healthy: false, points: 0, collection: null },
  });

  const checkHealth = useCallback(async () => {
    setIsLoading(true);

    try {
      // Check API health
      const apiResponse = await getHealth();
      const apiHealthy = apiResponse.data.status === "healthy";

      // Check embedding health
      let embeddingData = { status: "unknown", healthy: false, model: null, dimension: null };
      try {
        const embeddingResponse = await getEmbeddingHealth();
        embeddingData = {
          status: embeddingResponse.data.status,
          healthy: embeddingResponse.data.status === "healthy",
          model: embeddingResponse.data.model,
          dimension: embeddingResponse.data.dimension,
        };
      } catch (error) {
        embeddingData.status = "error";
      }

      // Check Qdrant health
      let qdrantData = { status: "unknown", healthy: false, points: 0, collection: null };
      try {
        const qdrantResponse = await getQdrantHealth();
        qdrantData = {
          status: qdrantResponse.data.exists ? "online" : "not_initialized",
          healthy: qdrantResponse.data.exists,
          points: qdrantResponse.data.points_count || 0,
          collection: qdrantResponse.data.collection,
        };
      } catch (error) {
        qdrantData.status = "error";
      }

      setServices({
        api: { status: apiResponse.data.status, healthy: apiHealthy },
        embedding: embeddingData,
        qdrant: qdrantData,
      });
    } catch (error) {
      setServices({
        api: { status: "offline", healthy: false },
        embedding: { status: "offline", healthy: false, model: null, dimension: null },
        qdrant: { status: "offline", healthy: false, points: 0, collection: null },
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const isHealthy = services.api.healthy && services.embedding.healthy && services.qdrant.healthy;

  return { isHealthy, isLoading, services, refetch: checkHealth };
}
