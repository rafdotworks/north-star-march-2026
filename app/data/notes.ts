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
    excerpt: "Enneagram, 16 Personalities, and Color Code.",
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

As previously posted on the [NBS blog](https://neverbeforeseen.co/blog/posts/designing-ai-agents).

As of February 2025, I'm designing AI agents that have reached over 41,000 daily users in less than a month. Here's what I've learned works best, written in plain language for founders and designers.

## In This Guide
1. What Makes Users Come Back
   - Quick Response Strategies
   - Starting Simple
   - User Control Principles
2. Common Mistakes to Avoid
   - Settings Overload
   - Value Proposition Issues
   - Partnership Benefits
3. Scaling Considerations
   - Technical Architecture
   - User Experience at Scale

## What Makes Users Come Back

### Quick Responses Matter
In the digital age, speed isn't just appreciated—it's expected. Users want instant feedback, and a delay can feel like an eternity. Here's how to meet this expectation:

- **Show Something Immediately**: Even if it's just a loading indicator, providing instant feedback reassures users that the system is responding.
- **Communicate During Delays**: Display messages like "Thinking…" or show a progress bar when the AI needs time to process.
- **Chunk Long Answers**: Instead of delivering one long response, break it into digestible parts so users can engage with content more effectively.
- **Clear Completion Indicators**: Ensure users know when the AI has finished its task. Avoid any ambiguity.

### Start Simple, Grow Naturally
The most successful AI designs evolve based on user needs. Complexity should emerge organically, not overwhelm users at the start:

- **Begin with Essentials**: Launch with a streamlined feature set that solves the most pressing problems.
- **Introduce Features Gradually**: Roll out advanced functionalities when users are ready for them.
- **Use Subtle Guidance**: Provide hints and tooltips that nudge users toward discovering capabilities naturally.
- **Encourage Exploration**: Let users learn by interacting. Those "aha" moments foster deeper engagement.

### Keep Users in Control
Empowerment is a cornerstone of trust. Users should feel they are steering the interaction, not being led astray:

- **Full Conversation Visibility**: Allow users to see the entire interaction history for context and clarity.
- **Clear Task Boundaries**: Signal when a task is complete to prevent confusion.
- **Easy Navigation**: Make it simple for users to revisit past answers or start fresh.
- **Reset Options**: Include a "start over" button for those who want a clean slate.

## Common Mistakes to Avoid

### Too Many Settings
Overloading users with choices can lead to decision paralysis. Here's how to avoid that trap:

- **Smart Defaults**: Set intuitive defaults that cater to the majority of users.
- **Progressive Disclosure**: Reveal settings as users need them—not all at once.

### Unclear Value Proposition
Many AI products fail because they don't clearly communicate their benefits:

- **Focus on Outcomes**: Highlight what users can achieve, not just the AI's capabilities. For example, instead of "Uses advanced NLP," say "Helps you write emails 3x faster."
- **Show Real Examples**: Demonstrate value through concrete use cases that resonate with your target users. Specific solutions convert better than abstract promises.
- **Measure What Matters**: Track metrics that reflect actual user success rather than vanity metrics. High usage doesn't always equate to high value.

### The Partnership Advantage
Working with our startup studio offers unique benefits for AI founders:

- **Rapid Prototyping**: Our experience with successful AI products means faster iteration cycles and fewer costly mistakes. We know what works and what doesn't across multiple verticals.
- **User Acquisition Expertise**: Beyond building great products, we excel at getting them in front of the right users. Our network and growth strategies have consistently delivered early traction.
- **Technical Infrastructure**: Access our battle-tested AI development stack and avoid months of setup time. Focus on your unique value proposition while leveraging proven foundations.

## Scaling Considerations

### Technical Architecture
Plan for growth from day one:

- **Modular Design**: Build components that can be easily upgraded or replaced as your AI capabilities evolve.
- **Performance Monitoring**: Implement comprehensive logging and monitoring to catch issues before they impact users.
- **Cost Management**: Design your architecture with unit economics in mind. Keep in mind that AI inference costs can scale non-linearly with user growth.

### User Experience at Scale
Different challenges emerge as you grow:

- **Multi-Language Support**: Consider internationalization early—even if you're starting in one market.
- **Edge Cases**: As your user base expands, edge cases become common. Build systems to systematically identify and address them.
- **Community Building**: Foster user communities that support one another and provide valuable feedback for product development.

Let's build something exceptional together. Our startup studio's track record of launching successful AI products, combined with your vision, can create remarkable outcomes. Reach out to discuss how we can help turn your AI concept into a thriving business.

## Key Takeaways for Immediate Action
1. **Start With One Thing**: Launch with a single, well-executed core feature that solves a specific problem for your users. More features can be added later.
2. **Speed > Perfection**: Implement quick responses and loading states today—even if your AI takes time to process. Users appreciate being acknowledged, even if minor errors occur.
3. **Measure Real Impact**: Track how many users actually achieve their goals rather than just how many use your product. This will guide more effective product development.
4. **Partner Smart**: Whether with our studio or other partners, work with those who have built what you're building. The right partnership can cut your time-to-market in half and help avoid common pitfalls.`,
    date: "2025-02-15",
    category: "work",
  },
  {
    id: "note-1",
    title: "My Music DNA",
    excerpt: " ",
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
    excerpt: "My first winter in Toronto.",
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
      return "bg-secondary/10 text-secondary";
    case "work":
      return "bg-accent/10 text-accent";
    case "ideas":
      return "bg-green-500/10 text-green-500";
    case "travel":
      return "bg-amber-500/10 text-amber-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};
