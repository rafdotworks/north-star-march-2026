export const getImagePlaceholder = (index: number): string => {
  const placeholderColors = [
    "rgba(245, 245, 245, 0.8)", // Light gray
    "rgba(240, 240, 245, 0.8)", // Light blue-gray
    "rgba(245, 240, 235, 0.8)", // Light warm gray
    "rgba(235, 240, 245, 0.8)", // Light cool gray
    "rgba(240, 245, 240, 0.8)", // Light mint
  ];

  return placeholderColors[index % placeholderColors.length];
};

export const imageLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
      resolve(); // Resolve anyway to prevent blocking
    };
  });
};

export const preloadImages = async (images: string[]): Promise<void> => {
  const promises = images.map(src => preloadImage(src));
  await Promise.all(promises);
};