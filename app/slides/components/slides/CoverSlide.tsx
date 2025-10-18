import React from "react";
import { slideTypography, slideOpacity } from "../../lib/typography";
import type { SlideData } from "../../slides-data";

export function CoverSlide({ data }: { data: SlideData }) {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <h1
        className={`${slideTypography.sizes.display} ${slideTypography.families.heading} ${slideTypography.leading.tight} ${slideTypography.tracking.tight}`}
      >
        {data.title}
      </h1>
      {data.subtitle && (
        <p
          className={`${slideTypography.sizes.subheading} ${slideOpacity.secondary}`}
        >
          {data.subtitle}
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
