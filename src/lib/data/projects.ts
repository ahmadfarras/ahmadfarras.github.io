import type { ComponentType } from "svelte";
import { MobilePhoneSolid } from "flowbite-svelte-icons";

export interface Project {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: ComponentType;
  tags: string[];
}

/** Projects shown in the Projects folder. Add a project by adding an entry here. */
export const projects: Project[] = [
  {
    id: "prototype-ar",
    title: "AR Product Prototype",
    description:
      "Web AR for physical products, with no app to install. Scan a product to pin an info card and a coupon to it, or scan its QR code to place the 3D model in your room at real size.",
    href: "https://prototype-ar.ahmadfarrassyafrin.com",
    icon: MobilePhoneSolid,
    tags: ["WebXR", "React", "TypeScript", "MindAR", "Fastify", "PostgreSQL"]
  }
];
