import React from "react";
import { slideTypography, slideOpacity, slideSpacing } from "../../lib/typography";
import type { FitSlideContent, SlideData } from "../../slides-data";

function isFitSlideContent(content: SlideData["content"]): content is FitSlideContent {
  return Boolean(
    content &&
      !Array.isArray(content) &&
      typeof content !== "string" &&
      "bestFit" in content &&
      "notFor" in content,
  );
}

export function FitSlide({ data }: { data: SlideData }) {
  const content = isFitSlideContent(data.content)
    ? data.content
    : { bestFit: [], notFor: [] };

  return (
    <div className="max-w-3xl mx-auto">
      {data.title && (
        <h2
          className={`${slideTypography.sizes.title} ${slideTypography.families.heading} mb-12 text-center`}
        >
          {data.title}
        </h2>
      )}

      <div className="grid md:grid-cols-2 gap-12">
        {/* Best Fit */}
        <div className={slideSpacing.sections.medium}>
          <h3 className={`${slideTypography.sizes.subheading} ${slideOpacity.secondary} mb-4`}>
            Best fit for:
          </h3>
          <div className={`${slideSpacing.sections.small} ${slideTypography.sizes.body}`}>
            {content.bestFit.map((item, index) => (
              <p key={index} className={slideOpacity.primary}>
                {item}
              </p>
            ))}
          </div>
        </div>

        {/* Not For */}
        <div className={slideSpacing.sections.medium}>
          <h3 className={`${slideTypography.sizes.subheading} ${slideOpacity.tertiary} mb-4`}>
            Not for:
          </h3>
          <div className={`${slideSpacing.sections.small} ${slideTypography.sizes.body}`}>
            {content.notFor.map((item, index) => (
              <p key={index} className={slideOpacity.tertiary}>
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
