import { getTranslations } from "next-intl/server";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/authz";
import { seDeconnecter } from "@/app/actions";
import { LogoMarkImg, Wordmark } from "./logo";
import { LanguageSwitcher } from "./language-switcher";
import { MainMenu } from "./main-menu";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-3 items-center gap-3 px-4 py-3">
        {/* Gauche : menu */}
        <div className="flex justify-start">
          <MainMenu connecte={!!user} deconnexion={seDeconnecter} />
        </div>

        {/* Centre : logo */}
        <Link href="/" className="flex items-center justify-center gap-2">
          <LogoMarkImg className="h-10 w-auto" priority />
          <Wordmark className="hidden text-xl font-extrabold tracking-tight sm:block" />
        </Link>

        {/* Droite : Signaler puis English (tout à droite) */}
        <div className="flex items-center justify-end gap-2">
          <Link
            href="/signaler"
            className="hidden items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 sm:inline-flex"
          >
            <IconPlus size={16} />
            {t("signaler")}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
