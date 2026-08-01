import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // sharp est un module natif : on le garde hors du bundle serveur.
  serverExternalPackages: ["sharp"],
  // La route de génération d'affiche lit le gabarit PDF + les polices Geist ;
  // on force leur inclusion dans la fonction serverless sur Vercel.
  outputFileTracingIncludes: {
    "/api/affiche/*": ["./src/lib/affiche/**/*"],
  },
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
