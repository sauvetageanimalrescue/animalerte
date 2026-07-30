"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("nav");
  const autre = locale === "fr" ? "en" : "fr";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: autre })}
      className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-brand-dark transition hover:bg-brand-soft"
    >
      {t("changerLangue")}
    </button>
  );
}
