import React from "react";
import { slideTypography, slideOpacity, slideSpacing } from "../../lib/typography";
import type { SlideData } from "../../slides-data";

export function ManifestoSlide({ data }: { data: SlideData }) {
  const rawContent = data.content;
  const content = Array.isArray(rawContent)
    ? rawContent
    : typeof rawContent === "string"
      ? [rawContent]
      : [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className={`${slideSpacing.sections.medium} ${slideTypography.sizes.heading} ${slideTypography.leading.relaxed}`}>
        {content.map((paragraph, index) => (
          <p key={index} className={slideOpacity.primary}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
