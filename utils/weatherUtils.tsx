import React from "react";

export const getWeatherColor = (condition: string | null): string => {
  if (!condition) return "rgba(125, 125, 125, 0.2)";

  const conditions: { [key: string]: string } = {
    Clear: "rgba(255, 200, 0, 0.3)",
    "Partly Cloudy": "rgba(230, 230, 230, 0.3)",
    Clouds: "rgba(200, 200, 200, 0.3)",
    Rain: "rgba(0, 125, 255, 0.3)",
    Drizzle: "rgba(100, 150, 255, 0.3)",
    "Freezing Drizzle": "rgba(180, 200, 255, 0.3)",
    "Freezing Rain": "rgba(150, 180, 255, 0.3)",
    Thunderstorm: "rgba(100, 100, 255, 0.4)",
    Snow: "rgba(220, 240, 255, 0.3)",
    Mist: "rgba(200, 200, 220, 0.3)",
    Fog: "rgba(180, 180, 200, 0.3)",
    Haze: "rgba(200, 180, 150, 0.3)",
  };

  return conditions[condition] || "rgba(125, 125, 125, 0.2)";
};

export const getWeatherIcon = (condition: string | null): JSX.Element | null => {
  if (!condition) return null;

  const icons: { [key: string]: JSX.Element } = {
    Clear: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3 h-3 inline-block align-middle"
      >
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
      </svg>
    ),
    "Partly Cloudy": (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3 h-3 inline-block align-middle"
      >
        <path d="M4.5 10.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        <path d="M17.5 6.5c0-2.76-2.24-5-5-5s-5 2.24-5 5c0 .34.04.67.09 1h-.09c-1.66 0-3 1.34-3 3s1.34 3 3 3h10c1.66 0 3-1.34 3-3s-1.34-3-3-3h-.09c.05-.33.09-.66.09-1z" />
      </svg>
    ),
    Clouds: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3 h-3 inline-block align-middle"
      >
        <path
          fillRule="evenodd"
          d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z"
          clipRule="evenodd"
        />
      </svg>
    ),
    Rain: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3 h-3 inline-block align-middle"
      >
        <path
          fillRule="evenodd"
          d="M12 5.25a6.75 6.75 0 00-6.75 6.75c0 3.296 2.114 6.258 5.25 7.31V22.5a.75.75 0 001.5 0v-3.19c3.136-1.052 5.25-4.014 5.25-7.31A6.75 6.75 0 0012 5.25zM15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    Snow: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3 h-3 inline-block align-middle"
      >
        <path
          fillRule="evenodd"
          d="M6.75 9a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H6.75zM6 12.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM6.75 16.5a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H6.75z"
          clipRule="evenodd"
        />
      </svg>
    ),
    Thunderstorm: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3 h-3 inline-block align-middle"
      >
        <path
          fillRule="evenodd"
          d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    icons[condition] || (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3 h-3 inline-block align-middle"
      >
        <path
          fillRule="evenodd"
          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
          clipRule="evenodd"
        />
      </svg>
    )
  );
};