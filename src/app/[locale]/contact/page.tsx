import { setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact-form";

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactForm />;
}
