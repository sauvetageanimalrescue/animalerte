import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Défaut de 1 Mo trop bas pour une photo prise au cellulaire.
      bodySizeLimit: "10mb",
    },
  },
  images: {
    // Les photos d'annonces sont servies depuis le Storage Supabase.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default withNextIntl(nextConfig);
