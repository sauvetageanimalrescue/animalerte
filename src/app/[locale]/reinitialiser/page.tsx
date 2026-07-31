import { setRequestLocale } from "next-intl/server";
import { FormNouveauMotDePasse } from "@/components/form-nouveau-mdp";

export default async function ReinitialiserPage({
  params,
}: PageProps<"/[locale]/reinitialiser">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FormNouveauMotDePasse />;
}
