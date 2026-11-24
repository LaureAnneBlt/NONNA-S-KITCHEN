import { twMerge } from "tailwind-merge";

/** Assemble des classes Tailwind : en cas de conflit (h-9 contre h-12…), la dernière gagne. */
export const cn = twMerge;
