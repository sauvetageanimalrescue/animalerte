-- ─────────────────────────────────────────────────────────────────────────
-- 0007 — Protection des colonnes de forfait/paiement
-- La RLS est au niveau LIGNE : un propriétaire peut modifier sa propre annonce,
-- donc en théorie changer « forfait »/« paye » sans payer. Ce trigger neutralise
-- toute modification de ces colonnes SAUF par le rôle service_role (le webhook
-- Stripe et la route de succès, qui font autorité après un vrai paiement).
-- Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.protege_forfait()
returns trigger
language plpgsql
as $$
begin
  -- PostgREST exécute « SET ROLE service_role » pour la clé service_role.
  if current_user is distinct from 'service_role' then
    new.forfait := old.forfait;
    new.paye := old.paye;
    new.paye_at := old.paye_at;
    new.stripe_session_id := old.stripe_session_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protege_forfait on public.annonces;
create trigger trg_protege_forfait
  before update on public.annonces
  for each row execute function public.protege_forfait();
