import type { Metadata } from "next";
import MachineScroll from "./MachineScroll";

export const metadata: Metadata = {
  title: "machine-scroll prototype",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MachineScroll />;
}
