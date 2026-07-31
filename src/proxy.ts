import { type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";

// Next.js 16 : « Middleware » s'appelle désormais « Proxy » (fichier proxy.ts,
// fonction proxy). Le comportement est identique.
const handleI18n = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. next-intl gère la négociation/redirection de locale et produit la réponse.
  const response = handleI18n(request);

  // 2. On rafraîchit la session Supabase en écrivant ses cookies sur cette réponse.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Rafraîchit le cookie de session au besoin ; requis pour que les Server
  // Components lisent une session valide à la requête suivante.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Tout sauf les fichiers statiques, l'API, le callback d'auth et les
  // ressources internes Next.
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
