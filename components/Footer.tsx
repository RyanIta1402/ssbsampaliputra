import Image from "next/image";

type Settings = {
  namaKlub?: string;
  tagline?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  youtube?: string;
};

function waLink(no?: string) {
  if (!no) return undefined;
  const digits = no.replace(/\D/g, "");
  if (!digits) return undefined;
  const normalized = digits.startsWith("0") ? "62" + digits.slice(1) : digits;
  return `https://wa.me/${normalized}`;
}

function IconInstagram() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.6 1.6-1.6h1.7V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V10.9H7.5V14h2.9v8h3.1z" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export default function Footer({ settings }: { settings?: Settings }) {
  const nama = settings?.namaKlub || "SSB Sampali Putra";
  const tahun = new Date().getFullYear();

  const socials = [
    {
      label: "Instagram",
      href: settings?.instagram || "#",
      icon: <IconInstagram />,
    },
    {
      label: "Facebook",
      href: settings?.facebook || "https://www.facebook.com/081375312900",
      icon: <IconFacebook />,
    },
    {
      label: "WhatsApp",
      href: waLink(settings?.whatsapp) || waLink("6285943268952") || "#",
      icon: <IconWhatsApp />,
    },
  ];

  return (
    <footer className="border-t border-bone/10 bg-coal py-14">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo SSB Sampali Putra"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
            <div>
              <div className="font-display text-lg uppercase tracking-wide text-bone">
                {nama}
              </div>
              <div className="font-body text-xs uppercase tracking-widest text-bone/40">
                {settings?.tagline || "Mencetak Bibit Pesepak Bola Sejak Dini"}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <span className="font-body text-xs font-bold uppercase tracking-widest text-bone/40">
              Ikuti Kami
            </span>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/15 text-bone/70 transition-colors hover:border-pitch hover:bg-pitch hover:text-ink"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-bone/10 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-bone/40">
            © {tahun} {nama}. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
