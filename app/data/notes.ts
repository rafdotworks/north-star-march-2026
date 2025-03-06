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
    id: "note-4",
    title: "My Personality Tests",
    excerpt: "",
    content: `# My Personality Test Results

I've taken three personality assessments to explore different facets of who I am: the Enneagram Test, the 16 Personalities Test, and the Color Code Test. Here's what I discovered.

## Enneagram Test
The Enneagram describes nine personality types, each driven by distinct motivations and fears.

**Type: 8 - The Challenger**
- Description: Eights are strong, assertive, and decisive, with a natural ability to lead and confront challenges. They value independence and strive to make an impact.
- Personal Insight: This fits me because I thrive on taking charge and pushing forward, especially in tough situations, though I'm learning to balance my intensity with openness.

## 16 Personalities Test
Based on the Myers-Briggs Type Indicator, this test identifies 16 personality types through four key traits.

**Type: ENTJ - The Commander**
- Description: ENTJs are strategic, confident, and goal-oriented, excelling at leading others and solving problems logically.
- Personal Insight: I see this in my love for planning and driving projects to completion, often preferring a clear path over indecision.

## Color Code Test
The Color Code uses colors to represent core motivations and personality traits.

**Dominant Color: Red (46.1%)**
- Description: Reds are motivated by power, seeking efficiency, productivity, and respect. They are proactive and direct, with a focus on results.
- Personal Insight: This reflects my drive to get things done quickly and effectively, though it reminds me to consider others' perspectives alongside my own.

These results paint a picture of someone who is action-oriented, leadership-focused, and determined to achieve goals. They highlight my strengths—like confidence and vision—while nudging me toward growth in areas like patience and emotional connection. I'm excited to use these insights to enhance how I work, relate to others, and approach life's challenges.`,
    date: "2025-03-06",
    category: "personal",
  },
  {
    id: "note-3",
    title: "On AI Agents",
    excerpt: "",
    content: `# On AI Agents

Coming soon.`,
    date: "2025-03-02",
    category: "work",
  },
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
