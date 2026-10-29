import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/"
      aria-label="Taxi Tap home"
      className="mb-8 inline-flex items-center gap-3 self-center"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#6D28D9] text-white">
        <svg
          aria-hidden="true"
          viewBox="0 0 32 32"
          className="size-8"
          fill="none"
        >
          <path
            d="M7 17.5 9.2 11a2 2 0 0 1 1.9-1.3h9.8a2 2 0 0 1 1.9 1.3l2.2 6.5v6.2h-2.7v-2.5H9.7v2.5H7v-6.2Z"
            fill="currentColor"
          />
          <path d="M10.4 12.2h11.2l1.5 4.3H8.9l1.5-4.3Z" fill="#6D28D9" />
          <circle cx="11" cy="18.8" r="1.2" fill="#6D28D9" />
          <circle cx="21" cy="18.8" r="1.2" fill="#6D28D9" />
          <path d="M5 8h4M23 8h4M12 5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-xl font-extrabold tracking-tight text-neutral-950">
        TAXI <span className="text-[#6D28D9]">TAP</span>
      </span>
    </Link>
  );
}
