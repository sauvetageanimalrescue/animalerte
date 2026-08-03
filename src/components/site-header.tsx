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
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <LogoMarkImg className="h-10 w-auto" priority />
          <Wordmark className="text-xl font-extrabold tracking-tight" />
        </Link>

        <MainMenu connecte={!!user} deconnexion={seDeconnecter} />

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/signaler"
            className="hidden items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 sm:inline-flex"
          >
            <IconPlus size={16} />
            {t("signaler")}
          </Link>
        </div>
      </div>
    </header>
  );
}
