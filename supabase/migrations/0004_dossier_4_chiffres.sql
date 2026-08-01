-- Migration 0004 : numéro de dossier à 4 chiffres (ex. 26-0001).
-- Auparavant 6 chiffres ; on passe à 4, ce qui limite à ~9999 dossiers par
-- année (jugé amplement suffisant). Idempotent (create or replace).

create or replace function public.attribuer_numero_dossier()
returns trigger
language plpgsql
as $$
begin
  if new.numero_dossier is null then
    new.numero_dossier := '26-' || lpad(nextval('dossier_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;
