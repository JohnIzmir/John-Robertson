
import { Topic } from './types';

export const TOPICS: Topic[] = [
  {
    id: 1,
    title: "Remote Working vs Office Working",
    opening: "Do you think working from home is better than working in an office?",
    followUps: ["What are the advantages and disadvantages of both?", "In what situations might office work be more effective?", "How could companies improve remote work systems?"]
  },
  {
    id: 2,
    title: "The Role of Social Media in Society",
    opening: "Do you believe social media has had a positive or negative impact on society?",
    followUps: ["Can you give examples to support your view?", "Should there be stricter regulation?", "How does it influence communication skills?"]
  },
  {
    id: 3,
    title: "Education and Success",
    opening: "Is formal education the most important factor in achieving success?",
    followUps: ["What other factors matter?", "Should education systems change?", "Can success be measured differently?"]
  },
  {
    id: 4,
    title: "Climate Responsibility",
    opening: "Who should take more responsibility for protecting the environment: individuals or governments?",
    followUps: ["What practical actions could be taken?", "Are current efforts sufficient?", "How might behaviour change in the future?"]
  },
  {
    id: 5,
    title: "Artificial Intelligence in Daily Life",
    opening: "Do you think artificial intelligence will improve people’s lives overall?",
    followUps: ["What risks might exist?", "In which areas could it be most useful?", "Should there be limits?"]
  },
  {
    id: 6,
    title: "Work-Life Balance",
    opening: "Is achieving work-life balance more difficult now than in the past?",
    followUps: ["Why might this be the case?", "What strategies could help?", "Should employers do more?"]
  },
  {
    id: 7,
    title: "Public Transport vs Private Cars",
    opening: "Should cities encourage people to use public transport instead of private cars?",
    followUps: ["What are the benefits and drawbacks?", "How could governments encourage change?", "Would this work in all areas?"]
  },
  {
    id: 8,
    title: "The Importance of Learning Languages",
    opening: "Do you think learning a second language is essential today?",
    followUps: ["In what situations is it most valuable?", "Should schools make it compulsory?", "How does it influence career opportunities?"]
  },
  {
    id: 9,
    title: "Technology and Children",
    opening: "Should children’s screen time be limited?",
    followUps: ["What are the possible consequences?", "Who should control this: parents or schools?", "Can technology be educational?"]
  },
  {
    id: 10,
    title: "The Future of Traditional Jobs",
    opening: "Do you believe automation will replace many traditional jobs?",
    followUps: ["Which industries are most at risk?", "How should society prepare?", "Could new jobs be created?"]
  },
  {
    id: 11,
    title: "University vs Apprenticeship",
    opening: "Is university always the best path after school?",
    followUps: ["What are the alternatives?", "What are the financial implications?", "How should young people decide?"]
  },
  {
    id: 12,
    title: "Healthy Living",
    opening: "Is it more important to eat well or exercise regularly?",
    followUps: ["How are the two connected?", "Why do people struggle to maintain healthy habits?", "What advice would you give?"]
  },
  {
    id: 13,
    title: "The Role of Government",
    opening: "Should governments intervene more in people’s daily lives?",
    followUps: ["In which areas?", "Where should limits exist?", "How does this affect personal freedom?"]
  },
  {
    id: 14,
    title: "Online Learning vs Classroom Learning",
    opening: "Is online learning as effective as face-to-face education?",
    followUps: ["For which learners might it work best?", "What are the disadvantages?", "Could a hybrid model be better?"]
  },
  {
    id: 15,
    title: "The Influence of Advertising",
    opening: "Does advertising influence people more than they realise?",
    followUps: ["In what ways?", "Should certain advertisements be restricted?", "How can consumers protect themselves?"]
  },
  {
    id: 16,
    title: "The Importance of Travel",
    opening: "Is travelling abroad essential for personal development?",
    followUps: ["What skills does travel develop?", "Can similar experiences be gained locally?", "How might travel change someone’s perspective?"]
  },
  {
    id: 17,
    title: "Equality in the Workplace",
    opening: "Do you think workplaces are truly equal today?",
    followUps: ["What challenges still exist?", "What improvements could be made?", "How can organisations promote fairness?"]
  },
  {
    id: 18,
    title: "Freedom of Speech",
    opening: "Should there be limits to freedom of speech?",
    followUps: ["Where should those limits exist?", "How can society balance safety and freedom?", "Can unrestricted speech cause harm?"]
  },
  {
    id: 19,
    title: "Urban vs Rural Living",
    opening: "Is it better to live in a city or in the countryside?",
    followUps: ["How does lifestyle differ?", "What are the economic implications?", "Where would you prefer to raise a family?"]
  },
  {
    id: 20,
    title: "The Meaning of Success",
    opening: "How would you define success in modern society?",
    followUps: ["Is success linked to money?", "Can success be personal rather than financial?", "Has the definition changed over time?"]
  }
];

export const CONVERSATION_SYSTEM_PROMPT = (topic: string, opening: string) => `
You are an English conversation partner for an ESOL learner working towards Ascentis ESOL Skills for Life Level 2 Speaking and Listening.
The learner has selected this topic: ${topic}.
Initial Question: ${opening}

RULES:
- Stay strictly on topic.
- Speak in natural, friendly British English.
- Ask one main question and one small follow-up in each turn.
- Encourage expansion only if answers are short.
- Sometimes gently agree; sometimes challenge politely.
- If unclear, ask directly: "Sorry, can you explain that?"
- Do NOT correct grammar during the conversation.
- Only clarify meaning if misunderstanding blocks communication.
- Encourage the learner to: Explain opinions, give reasons, provide examples, compare ideas, justify views, suggest solutions.
- DO NOT mention assessment criteria.
- Conversation ends ONLY when the learner says: "In conclusion..." or "To sum up..."
- When ending, ask one final short confirmation question if needed, then state the token: [CONVERSATION_FINISHED].
`;

export const FEEDBACK_SYSTEM_PROMPT = `
You are a senior ESOL teacher assessing a learner's performance against Ascentis ESOL Skills for Life Level 2 standards.
Based on the provided conversation transcript, generate a structured feedback report.

ASSESSMENT CRITERIA:
1. Listening & Understanding: Follow gist, obtain detail.
2. Speaking Accuracy & Control: Pronunciation (infer from transcript if possible, or focus on grammar/register), appropriate register.
3. Conveying Information: Logical sequencing, confident account, relevant detail.
4. Discussion Skills: Constructive contributions, expressing views, moving discussion forward, asking questions.

LOOK FOR EVIDENCE OF:
Logical structure, discourse markers, modal verbs, passive voice, complex sentences, conditionals, reported speech, formal/informal register, moving discussion forward phrases.

RESPONSE FORMAT (JSON):
{
  "criteria": [
    { "label": "Listening & Understanding", "status": "Met|Partly Met|Not Yet Met", "explanation": "...", "evidence": "..." },
    ... (for all 4 categories)
  ],
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "...", "..."],
  "spokenScript": "..."
}
`;
