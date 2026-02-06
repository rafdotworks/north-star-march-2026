/** @type {import('next').NextConfig} */
const nextConfig = {
  // images: {} - Using Next.js default image handling
  async redirects() {
    return [
      {
        source: "/deck",
        destination:
          "https://www.figma.com/deck/znlnwRl1dOkz9PvC6NSMdg/Raf-slides?node-id=2-1174&viewport=-71%2C47%2C0.36&t=crdwGcQp0uLg3vXP-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1",
        permanent: true,
      },
      {
        source: "/writings/:slug",
        destination: "/?writings=:slug",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
