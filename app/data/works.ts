export interface Work {
  title: string;
  description: string;
  image: string;
  video?: string;
}

export const works: Work[] = [
  {
    title: "Work 1",
    description: "Description of work 1",
    image: "/images/work1.jpg",
    video: "/videos/work1.mp4",
  },
  {
    title: "Work 2",
    description: "Description of work 2",
    image: "/images/work2.jpg",
    video: "/videos/work2.mp4",
  },
  {
    title: "Work 3",
    description: "Description of work 3",
    image: "/images/work3.jpg",
    video: "/videos/work3.mp4",
  },
];
