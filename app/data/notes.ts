export type NoteCategory = "personal" | "work" | "ideas" | "travel";

export interface Note {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: NoteCategory;
}

export const notes: Note[] = [
  {
    id: "note-1",
    title: "My Music DNA",
    excerpt: "",
    content: `# My Music DNA

These songs have been profoundly influential in my life, each bringing unique emotions and memories:

- **Teardrop** by Massive Attack
- **Io per lei** by Pino Daniele
- **Stairway to Heaven** by Led Zeppelin
- **Desecration Smile** by Red Hot Chili Peppers
- **Black Sand** by Bonobo
- **Experience** by Ludovico Einaudi

`,
    date: "2025-03-05",
    category: "personal",
  },
  {
    id: "note-2",
    title: "Slipping Through Winter",
    excerpt: "",
    content: `# Slipping Through Winter

It was early morning, and I was walking to yoga. Two weeks ago, a huge snowstorm hit Toronto, and since it's my first winter here, everything feels fresh and new. The snow was piled up, covering the streets, and I loved how quiet it made everything feel. But what I didn't know was that under the new snow, there was old, icy snow hiding.

Then it happened—I slipped on a patch of that hidden ice. One second I was walking, the next I was down, smashing into my right rib. It hurt bad. I've got a high bar for pain, though, so I don't usually make a big deal out of it. I brushed myself off and kept going to yoga, even with my side aching.

The pain's still there, nagging me every day since. But here's the thing: it's also made me grateful. Falling like that opened my eyes to something new about winter here. Now I'm more careful, paying attention to each step I take. It could've been so much worse, and I'm thankful it wasn't. This whole thing's been a wake-up call to stay present and watch where I'm going.`,
    date: "2025-02-26",
    category: "personal",
  },

  {
    id: "note-3",
    title: "On AI Agents",
    excerpt: "",
    content: `# On AI Agents

Coming soon.`,
    date: "2025-03-06",
    category: "work",
  },
];

export const getCategoryColor = (category: NoteCategory): string => {
  switch (category) {
    case "personal":
      return "bg-blue-500/10 text-blue-500";
    case "work":
      return "bg-purple-500/10 text-purple-500";
    case "ideas":
      return "bg-green-500/10 text-green-500";
    case "travel":
      return "bg-amber-500/10 text-amber-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};
