const { QdrantClient } = require("@qdrant/js-client-rest");
const crypto = require("crypto");
const { EMBEDDING_DIMENSIONS } = require("./embeddingService");

// Qdrant requires point IDs to be UUIDs or unsigned integers.
// Convert arbitrary string IDs (e.g. "user-abc123") to deterministic UUIDs.
const toUUID = (id) => {
  const hash = crypto.createHash("md5").update(String(id)).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
};

const COLLECTIONS = {
  users: "osspath_users",
  issues: "osspath_issues",
  repositories: "osspath_repositories",
};

let client;
let disabled = false;

const getClient = () => {
  if (disabled || !process.env.QDRANT_URL) return null;
  if (!client) client = new QdrantClient({ url: process.env.QDRANT_URL });
  return client;
};

const ensureCollection = async (collectionName) => {
  const qdrant = getClient();
  if (!qdrant) return false;

  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections?.some((collection) => collection.name === collectionName);
    if (!exists) {
      await qdrant.createCollection(collectionName, {
        vectors: { size: EMBEDDING_DIMENSIONS, distance: "Cosine" },
      });
    }
    return true;
  } catch (err) {
    disabled = true;
    console.warn("Qdrant unavailable, continuing without vector DB:", err.message);
    return false;
  }
};

const upsertVector = async ({ collection, id, vector, payload }) => {
  if (!vector?.length || !id) return false;
  const ready = await ensureCollection(collection);
  if (!ready) return false;

  await getClient().upsert(collection, {
    points: [{ id: toUUID(id), vector, payload: { ...payload, originalId: id } }],
  });
  return true;
};

const searchVectors = async ({ collection, vector, limit = 10, filter }) => {
  const ready = await ensureCollection(collection);
  if (!ready || !vector?.length) return [];

  return getClient().search(collection, {
    vector,
    limit,
    filter,
    with_payload: true,
  });
};

module.exports = {
  COLLECTIONS,
  searchVectors,
  upsertVector,
};
