import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { IconMessage2 } from "@tabler/icons-react";
import { getCurrentUser, estAdmin } from "@/lib/authz";
import { AdminSmsForm } from "@/components/admin-sms-form";

// Message respectueux pré-rempli, modifiable avant l'envoi.
const MESSAGE_DEFAUT =
  "Bonjour, j'ai vu votre affiche pour votre animal perdu. Il existe une plateforme qui aide à retrouver les animaux perdus : affiche, alertes de proximité et reconnaissance par intelligence artificielle. Il est possible d'y publier une fiche gratuitement. En espérant que votre animal rentre vite à la maison.\nwww.animalerte.ca";

export default async function PageAdminSms({
  params,
}: PageProps<"/[locale]/administration/sms">) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Page strictement réservée aux administrateurs : invisible aux autres.
  const user = await getCurrentUser();
  if (!estAdmin(user)) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-widest text-accent">
        Administration
      </p>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold text-brand-dark">
        <IconMessage2 size={26} className="text-brand" />
        Envoyer un SMS
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Vous avez vu une affiche d'animal perdu ? Entrez le numéro de téléphone,
        ajustez le message au besoin, puis envoyez une invitation courtoise à
        publier sur animALERTE. Le message part du numéro officiel animALERTE
        (1&nbsp;833&nbsp;999&nbsp;AIDE / 438&nbsp;813-3911).
      </p>

      <AdminSmsForm messageDefaut={MESSAGE_DEFAUT} />
    </div>
  );
}
