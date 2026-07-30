"use client";

import { useLocale, useTranslations } from "next-intl";
import { IconWorld } from "@tabler/icons-react";
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
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-brand-dark transition hover:bg-brand-soft"
    >
      <IconWorld size={16} />
      {t("changerLangue")}
    </button>
  );
}
