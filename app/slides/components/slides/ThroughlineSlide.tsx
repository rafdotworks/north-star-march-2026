import React from "react";
import { slideTypography, slideOpacity, slideSpacing } from "../../lib/typography";
import type { SlideData } from "../../slides-data";

export function ThroughlineSlide({ data }: { data: SlideData }) {
  const rawContent = data.content;
  const content = Array.isArray(rawContent)
    ? rawContent
    : typeof rawContent === "string"
      ? [rawContent]
      : [];

  return (
    <div className="max-w-3xl mx-auto text-center">
      {data.title && (
        <h2
          className={`${slideTypography.sizes.title} ${slideTypography.families.heading} ${slideTypography.leading.tight} mb-12`}
        >
          {data.title}
        </h2>
      )}
      <div className={`${slideSpacing.sections.large} ${slideTypography.sizes.body}`}>
        {content.map((item, index) => (
          <div key={index} className={slideOpacity.secondary}>
            {item}
          </div>
        ))}
      </div>
      {data.caption && (
        <p
          className={`${slideTypography.sizes.small} ${slideOpacity.tertiary} mt-12 italic`}
        >
          {data.caption}
        </p>
      )}
    </div>
  );
}
