import type { Metadata } from "next"

import WorksHomepage from "@/app/components/pages/WorksHomepage"

export const metadata: Metadata = {
  title: "Works | Raf V.",
  description:
    "Selected work by Raf V. across AI products, design systems, interaction design, and design engineering.",
}

export default function WorksPage() {
  return <WorksHomepage />
}
