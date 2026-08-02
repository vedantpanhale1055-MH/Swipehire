// lib/mockJobs.js
// Temporary mock data for the discover feed until job aggregation (lib/jobSources.js) is wired in.

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
  },
];

export default mockJobs;