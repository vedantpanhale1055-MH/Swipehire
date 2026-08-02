// lib/mockJobs.js
// Temporary mock data for the discover feed and job detail page until job
// aggregation (lib/jobSources.js) and AI matching are wired in.

const mockJobs = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "Nimbus Labs",
    location: "Remote",
    salary: "₹8L - ₹12L / yr",
    tags: ["React", "Next.js", "CSS"],
    matchScore: 92,
    description:
      "Build and ship user-facing features for a fast-growing SaaS product. Work closely with design to turn Figma files into polished, responsive UI.",
    matchReasoning:
      "Your experience with React and component-driven UI work lines up closely with this role. Your recent projects show strong CSS and layout skills, and your portfolio reflects the kind of polished, responsive interfaces this team is looking for.",
    matchedSkills: ["React", "Next.js", "CSS", "Responsive Design"],
    interviewTips: [
      {
        title: "Understand Nimbus Labs' product",
        detail: "Explore their product and recent feature launches. Focus on how they think about speed and simplicity.",
      },
      {
        title: "Practice component challenges",
        detail: "Be ready to build or refactor a small UI component live. Explain your structure and state choices as you go.",
      },
      {
        title: "Common questions",
        detail: "Why frontend? How do you approach responsive design? Walk through a recent project you're proud of.",
      },
    ],
    about:
      "Nimbus Labs builds SaaS tools for small teams, focused on speed, simplicity, and clean design.",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "Fieldstone",
    location: "Pune, IN",
    salary: "₹6L - ₹10L / yr",
    tags: ["Figma", "UX Research", "Design Systems"],
    matchScore: 85,
    description:
      "Own end-to-end design for core product flows, from research to high-fidelity prototypes. Collaborate directly with engineering on implementation.",
    matchReasoning:
      "Your UI/UX background and hands-on Figma experience match what this role needs. Your process of moving from research to high-fidelity prototypes mirrors how Fieldstone's design team works.",
    matchedSkills: ["Figma", "UX Research", "Prototyping", "Design Systems"],
    interviewTips: [
      {
        title: "Understand Fieldstone's product",
        detail: "Look at their core flows and note where you'd improve the experience.",
      },
      {
        title: "Practice case studies",
        detail: "Be ready to walk through an open-ended design problem, structuring your approach clearly.",
      },
      {
        title: "Common questions",
        detail: "Why Fieldstone? How do you handle ambiguous requirements? Walk through your design process.",
      },
    ],
    about:
      "Fieldstone builds tools that help small teams collaborate better, with a strong focus on thoughtful, research-driven design.",
  },
  {
    id: "3",
    title: "Full Stack Engineer",
    company: "Verdant",
    location: "Bengaluru, IN",
    salary: "₹10L - ₹16L / yr",
    tags: ["Node.js", "PostgreSQL", "React"],
    matchScore: 78,
    description:
      "Work across the stack on a small team shipping weekly. Ownership over features from database schema to deployed UI.",
    matchReasoning:
      "You've worked across both frontend and backend, which fits this full-stack role well. Your familiarity with React covers the UI side, though deeper PostgreSQL experience would strengthen your fit.",
    matchedSkills: ["React", "Node.js", "APIs"],
    interviewTips: [
      {
        title: "Understand Verdant's stack",
        detail: "Review their tech stack and be ready to discuss trade-offs in schema design.",
      },
      {
        title: "Practice full-stack problems",
        detail: "Be ready to reason about a feature end-to-end, from database to UI.",
      },
      {
        title: "Common questions",
        detail: "How do you balance frontend and backend ownership? Walk through a feature you built end-to-end.",
      },
    ],
    about:
      "Verdant is a small, fast-moving team shipping product updates weekly, with full ownership given to engineers.",
  },
  {
    id: "4",
    title: "UI Engineer Intern",
    company: "Loop Studio",
    location: "Remote",
    salary: "₹25k / month",
    tags: ["JavaScript", "CSS", "Animation"],
    matchScore: 88,
    description:
      "3-month internship building interactive UI components and motion for marketing sites and product surfaces.",
    matchReasoning:
      "Your interest in interactive UI and CSS animation work is a strong fit for this internship. Your project work shows attention to motion and detail, which is exactly what this team values.",
    matchedSkills: ["JavaScript", "CSS", "Animation"],
    interviewTips: [
      {
        title: "Understand Loop Studio's work",
        detail: "Look through their portfolio site and note animation techniques they favor.",
      },
      {
        title: "Practice small UI builds",
        detail: "Be ready to build a small interactive component and explain your CSS/animation choices.",
      },
      {
        title: "Common questions",
        detail: "Why motion design? Walk through a project where animation improved the experience.",
      },
    ],
    about:
      "Loop Studio is a small design-led studio building marketing sites and product surfaces with a focus on motion and craft.",
  },
  {
    id: "5",
    title: "Junior Software Engineer",
    company: "Kestrel Systems",
    location: "Hyderabad, IN",
    salary: "₹7L - ₹9L / yr",
    tags: ["JavaScript", "APIs", "Testing"],
    matchScore: 74,
    description:
      "Entry-level role on a backend-leaning team. Mentorship provided, strong emphasis on code quality and testing practices.",
    matchReasoning:
      "Your JavaScript fundamentals and exposure to APIs are a reasonable starting point for this entry-level role. Deeper testing experience would strengthen your application further.",
    matchedSkills: ["JavaScript", "APIs"],
    interviewTips: [
      {
        title: "Understand Kestrel's approach",
        detail: "Review their engineering blog if available, and note how they talk about code quality.",
      },
      {
        title: "Practice fundamentals",
        detail: "Be ready for basic data structure and API design questions.",
      },
      {
        title: "Common questions",
        detail: "Why backend? How do you approach testing? Walk through a bug you debugged recently.",
      },
    ],
    about:
      "Kestrel Systems is a backend-focused engineering team with a strong mentorship culture for junior hires.",
  },
];

export default mockJobs;