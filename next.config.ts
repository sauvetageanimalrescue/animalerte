import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Modules natifs / WASM : hors du bundle serveur.
  serverExternalPackages: ["sharp", "mupdf"],
  // Les routes de génération lisent les gabarits PDF + polices Geist ;
  // on force leur inclusion dans les fonctions serverless sur Vercel.
  outputFileTracingIncludes: {
    "/api/affiche/*": ["./src/lib/affiche/**/*"],
    "/api/carre/*": ["./src/lib/affiche/**/*"],
    "/api/story/*": ["./src/lib/affiche/**/*"],
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
