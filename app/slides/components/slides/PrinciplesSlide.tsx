import React from "react";
import { slideTypography, slideOpacity, slideSpacing } from "../../lib/typography";
import type { SlideData } from "../../slides-data";

export function PrinciplesSlide({ data }: { data: SlideData }) {
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
          className={`${slideTypography.sizes.title} ${slideTypography.families.heading} mb-8`}
        >
          {data.title}
        </h2>
      )}
      <div className={`${slideSpacing.sections.medium} ${slideTypography.sizes.body}`}>
        {content.map((principle, index) => (
          <p key={index} className={slideOpacity.secondary}>
            {principle}
          </p>
        ))}
      </div>
    </div>
  );
}
