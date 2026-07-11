let extractorPromise;

const EMBEDDING_DIMENSIONS = 384;

const getExtractor = async () => {
  if (process.env.DISABLE_LOCAL_EMBEDDINGS === "true") return null;

  if (!extractorPromise) {
    extractorPromise = import("@xenova/transformers")
      .then(({ pipeline }) => pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2"))
      .catch((err) => {
        console.warn("Embedding model unavailable, using deterministic fallback:", err.message);
        return null;
      });
  }

  return extractorPromise;
};

const embedText = async (text = "") => {
  const input = String(text || "").slice(0, 8000);
  const extractor = await getExtractor();

  if (!extractor || !input.trim()) {
    return fallbackEmbedding(input);
  }

  const output = await extractor(input, { pooling: "mean", normalize: true });
  return Array.from(output.data);
};

const fallbackEmbedding = (text = "") => {
  const vector = new Array(EMBEDDING_DIMENSIONS).fill(0);
  const tokens = text.toLowerCase().match(/[a-z0-9+#.-]+/g) || [];

  tokens.forEach((token, tokenIndex) => {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const index = Math.abs(hash) % EMBEDDING_DIMENSIONS;
    vector[index] += 1 + (tokenIndex % 7) / 10;
  });

  return normalizeVector(vector);
};

const normalizeVector = (vector) => {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / magnitude);
};

const cosineSimilarity = (a = [], b = []) => {
  const length = Math.min(a.length, b.length);
  if (!length) return 0;

  let dot = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;

  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    aMagnitude += a[i] * a[i];
    bMagnitude += b[i] * b[i];
  }

  const denominator = Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude);
  return denominator ? dot / denominator : 0;
};

module.exports = {
  EMBEDDING_DIMENSIONS,
  cosineSimilarity,
  embedText,
};
