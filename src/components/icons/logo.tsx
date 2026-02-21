import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-6", className)}
    >
      <path d="M12 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10c0 2.21-0.713 4.25-1.928 5.928" />
      <path d="M12 10c-3.314 0-6 2.686-6 6h12c0-3.314-2.686-6-6-6Z" />
      <path d="M12 2a4 4 0 0 0-4 4c0 1.48.8 2.77 2 3.5V10" />
    </svg>
  );
}
