import React from "react";
import Image from "next/image";
import { slideTypography, slideOpacity, slideSpacing } from "../../lib/typography";
import type { SlideData } from "../../slides-data";

export function ProjectSlide({ data }: { data: SlideData }) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <div className={slideSpacing.sections.medium}>
          {data.title && (
            <h3
              className={`${slideTypography.sizes.subheading} ${slideOpacity.tertiary} mb-4`}
            >
              {data.title}
            </h3>
          )}
          {data.metadata?.company && (
            <h2
              className={`${slideTypography.sizes.title} ${slideTypography.families.heading} mb-2`}
            >
              {data.metadata.company}
            </h2>
          )}
          {data.metadata?.role && (
            <p className={`${slideTypography.sizes.small} ${slideOpacity.tertiary} mb-6`}>
              {data.metadata.role}
            </p>
          )}
          {data.metadata?.highlights && (
            <div className={`${slideSpacing.sections.small} ${slideTypography.sizes.body}`}>
              {data.metadata.highlights.map((highlight, index) => (
                <p key={index} className={slideOpacity.secondary}>
                  {highlight}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        {data.images && data.images.length > 0 && (
          <div className={`${slideSpacing.sections.small}`}>
            {data.images.map((image, index) => (
              <div
                key={index}
                className="relative w-full aspect-video rounded-lg overflow-hidden border border-foreground/[0.08]"
              >
                <Image
                  src={image}
                  alt={`${data.metadata?.company} project ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
