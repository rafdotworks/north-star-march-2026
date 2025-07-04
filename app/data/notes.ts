export interface Note {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
}

export const notes: Note[] = [
  {
    id: "note-6",
    title: "Config, SF, and slowing down",
    excerpt: "Reflections on Config 2025 and the importance of calm in design.",
    content: `San Francisco felt alive. Config pulsed with energy—people building fast, launching faster. The whole industry feels like it's in motion, always reaching for what's next.

But I left with a different instinct: to slow down.

There's power in stillness. In choosing clarity over noise. Calm over chaos. I'm more certain than ever that design isn't about keeping pace with the rush. It's about creating space. For thoughtfulness. For care. For simplicity that serves, not just decorates.

I'm glad to see Figma evolve and expand. But what matters more is how we use the tools, not just what they can do. Speed is tempting, but I don't think the goal is to go from zero to one as fast as possible. The goal is to go somewhere meaningful; together.

And for that, we need trust. Not consensus. Not applause. Listening, really listening, is more important than being liked. 

I'm leaning into the best work coming from honest collaboration and quiet conviction. 

Progress, not performance. Care, not noise. That's the direction I want to move in.`,
    date: "2025-05-09",
  },
  {
    id: "note-5",
    title: "'Why are there frequent job changes on your LinkedIn?'",
    excerpt: "On career transitions.",
    content: `# Why are there frequent job changes on your LinkedIn?

## The Questions That Matter

Two questions have stayed with me recently:

1. **"Why are there frequent job changes on your LinkedIn?"**
2. **"What does true co-creation look like for you?"**

These weren't trick questions. They were real ones — the kind that reveal who someone is, not just what they've done.

---

## On Career Transitions

When asked about the job changes, I responded with what felt true (thank you Granola.so for your transcript):

> I've always been intentional about where I spend my energy. Every move has been tied to growth, to learning something new, or to stepping into the kind of environment where I could truly stretch. I've left roles by choice — not due to performance issues — but because I felt the arc had completed, or the environment no longer allowed me to thrive.

> I'm most drawn to places where there's product ambiguity and room to bring clarity. Where cross-functional collaboration isn't just a slide deck idea — it's how work actually happens. I look for teams with strong technical minds I can learn from, and people who are genuinely passionate about what they're building. I'm not chasing a ladder. I'm chasing momentum and meaning."

---

## On True Co-Creation

Then came a question I wish more people asked:

> What does true co-creation look like for you?

And I knew exactly how to answer:

> True co-creation is about pace, trust, and alignment. It's not about endless prep or sign-offs — it's about shortening the space between planning and building.

> When it works well, we move from input to action quickly — gathering what we need, syncing as a team, then creating something tangible within days. Even hours, sometimes. It doesn't need to be final. It just needs to be real.

> What matters is having clear direction, even if informal — a shared pulse. When you can feel the 'go' without having to ask twice, that's where the magic begins. That's the kind of collaboration I seek.

---

## Final Thoughts

These questions went deeper than the usual script. They asked about intention. About how I move, and how I create.

And we need more of those.

`,
    date: "2025-04-11",
  },
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
  },
  {
    id: "note-7",
    title: "Memorable Excellence",
    excerpt: "",
    content: `There are people I know...

Scott, opening the doors of Shopify Builders every Sunday with dedication.
Hélder, behind the counter at Manna in Porto, precise in every move.

Then there are people I don't know directly

A nurse I met years ago, adjusting a blanket with care and an unmistakable smile.
A flight attendant on my last flight back to Toronto, moving through the cabin like choreography — steady, warm, direct.

They're both excellent at what they do.
So present, so attuned, they become unforgettable.

Meditation helped me notice this more.
It tuned me into the grace of people simply being great.
No spotlight. No audience. Just presence. Just noticing it. 

That's the kind of presence I aim for in my work, too.

For all the countless ones who made me feel something. Thank you.`,
    date: "2025-06-14",
  },
];
