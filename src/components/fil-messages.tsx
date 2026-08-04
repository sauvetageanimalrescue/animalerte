import { getTranslations } from "next-intl/server";

type Message = {
  id: string;
  expediteur: "proprietaire" | "trouveur";
  corps: string;
  created_at: string;
};

// Affiche un fil de conversation. `moi` = de quel côté est le lecteur, pour
// aligner ses propres messages à droite.
export async function FilMessages({
  messages,
  moi,
}: {
  messages: Message[];
  moi: "proprietaire" | "trouveur";
}) {
  const t = await getTranslations("messages");
  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => {
        const estMoi = m.expediteur === moi;
        const auteur =
          m.expediteur === "proprietaire" ? t("laFamille") : t("leTrouveur");
        return (
          <div
            key={m.id}
            className={`flex flex-col ${estMoi ? "items-end" : "items-start"}`}
          >
            <span className="mb-0.5 px-1 text-[11px] text-muted">
              {estMoi ? t("vous") : auteur}
            </span>
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                estMoi
                  ? "bg-brand text-white"
                  : "border border-border bg-surface text-foreground"
              }`}
            >
              {m.corps}
            </div>
          </div>
        );
      })}
    </div>
  );
}
