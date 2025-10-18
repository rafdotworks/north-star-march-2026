import React from "react";
import { slideTypography, slideOpacity, slideSpacing } from "../../lib/typography";
import type { SlideData } from "../../slides-data";

export function ActSlide({ data }: { data: SlideData }) {
  const rawContent = data.content;
  const content = Array.isArray(rawContent)
    ? rawContent
    : typeof rawContent === "string"
      ? [rawContent]
      : [];

  return (
    <div className="max-w-3xl mx-auto">
      {data.title && (
        <h2
          className={`${slideTypography.sizes.title} ${slideTypography.families.heading} ${slideTypography.leading.tight} mb-8`}
        >
          {data.title}
        </h2>
      )}
      {content.length > 0 && (
        <div className={`${slideSpacing.sections.medium} ${slideTypography.sizes.body}`}>
          {content.map((paragraph, index) => (
            <p key={index} className={slideOpacity.secondary}>
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
