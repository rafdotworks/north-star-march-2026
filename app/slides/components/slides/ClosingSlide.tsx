import React from "react";
import { slideTypography, slideOpacity } from "../../lib/typography";
import type { SlideData } from "../../slides-data";

export function ClosingSlide({ data }: { data: SlideData }) {
  const content = typeof data.content === "string" ? data.content : null;

  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      {data.title && (
        <h2
          className={`${slideTypography.sizes.display} ${slideTypography.families.heading} ${slideTypography.leading.tight} ${slideTypography.tracking.tight}`}
        >
          {data.title}
        </h2>
      )}
      {content && (
        <p
          className={`${slideTypography.sizes.heading} ${slideOpacity.secondary}`}
        >
          {content}
        </p>
      )}
      {data.details && (
        <p
          className={`${slideTypography.sizes.small} ${slideOpacity.tertiary} ${slideTypography.tracking.wide}`}
        >
          {data.details}
        </p>
      )}
    </div>
  );
}
