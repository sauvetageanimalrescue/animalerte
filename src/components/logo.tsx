import Image from "next/image";

// Logo officiel complet (mark + mot-clé « animALERTE »), déposé dans /public.
export function Logo({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="animALERTE"
      width={512}
      height={512}
      priority={priority}
      className={className}
    />
  );
}

// Mark seul (oreilles + onde), extrait du logo officiel — pour l'en-tête où on
// l'accole au mot-clé texte. Hérite de la taille via className (ex. `h-9 w-auto`).
export function LogoMarkImg({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-mark.png"
      alt="animALERTE"
      width={288}
      height={228}
      priority={priority}
      className={className}
    />
  );
}

// Mark animALERTE : oreilles d'animal + onde de diffusion (alerte).
// Recréation vectorielle aux couleurs de la marque ; hérite de la taille via
// className (ex. `h-9 w-9`).
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
      className={className}
    >
      {/* Oreilles */}
      <path d="M12 12 L48 20 L42 62 L20 70 Z" fill="var(--brand-light)" />
      <path d="M108 12 L72 20 L78 62 L100 70 Z" fill="var(--brand-light)" />
      {/* Ondes de diffusion */}
      <g fill="none" strokeLinecap="round">
        <path
          d="M18 92 A48 48 0 0 1 102 92"
          stroke="var(--brand-dark)"
          strokeWidth="12"
        />
        <path
          d="M35 98 A31 31 0 0 1 85 98"
          stroke="var(--brand-light)"
          strokeWidth="12"
        />
        <path
          d="M50 103 A14 14 0 0 1 70 103"
          stroke="var(--brand-dark)"
          strokeWidth="12"
        />
      </g>
      <circle cx="60" cy="106" r="8" fill="var(--brand-dark)" />
    </svg>
  );
}

// Wordmark « animALERTE » : « anim » marine, « ALERTE » rouge.
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-brand-dark">anim</span>
      <span className="text-accent">ALERTE</span>
    </span>
  );
}

// Wordmark « flAIr » : « fl » et « r » marine, « AI » rouge (le AI dans le mot).
export function FlairWord({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-brand-dark">fl</span>
      <span className="text-accent">AI</span>
      <span className="text-brand-dark">r</span>
    </span>
  );
}
