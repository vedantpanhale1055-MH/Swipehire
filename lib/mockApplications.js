// lib/mockApplications.js
// Temporary mock data for the Applications Kanban board.

const mockApplications = {
  saved: [
    { id: "a1", company: "Notion", role: "Product Designer", timestamp: "Saved 2d ago", initial: "N", color: "#1c1917" },
    { id: "a2", company: "Shopify", role: "UX Designer", timestamp: "Saved 5d ago", initial: "S", color: "#059669" },
    { id: "a3", company: "Figma", role: "Product Designer", timestamp: "Saved 1w ago", initial: "F", color: "#a855f7" },
  ],
  applied: [
    { id: "a4", company: "Google", role: "UX Designer", timestamp: "Applied 3d ago", initial: "G", color: "#ea4335" },
    { id: "a5", company: "Microsoft", role: "Product Designer", timestamp: "Applied 1w ago", initial: "M", color: "#00a4ef" },
    { id: "a6", company: "Airbnb", role: "Product Designer", timestamp: "Applied 1w ago", initial: "A", color: "#ff5a5f" },
    { id: "a7", company: "Spotify", role: "UX Designer", timestamp: "Applied 2w ago", initial: "S", color: "#1db954" },
  ],
  interview: [
    { id: "a8", company: "Linear", role: "Product Designer", timestamp: "Interview in 2d", initial: "L", color: "#5e6ad2" },
    { id: "a9", company: "Atlassian", role: "UX Designer", timestamp: "Interview in 1w", initial: "A", color: "#0052cc" },
  ],
  offer: [
    { id: "a10", company: "Framer", role: "Product Designer", timestamp: "Offer", initial: "F", color: "#0055ff" },
  ],
};

export default mockApplications;