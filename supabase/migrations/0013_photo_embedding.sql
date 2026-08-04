-- ─────────────────────────────────────────────────────────────────────────
-- 0013 — Empreinte visuelle de la photo principale (flAIr étape 3)
-- Vecteur d'embedding (Voyage multimodal) rangé dans un tableau de réels. À
-- l'échelle actuelle, la ressemblance se calcule en JavaScript (cosinus), sans
-- pgvector. Si le volume grandit, on migrera vers un type vector + index HNSW.
-- Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.annonces
  add column if not exists photo_embedding real[];
