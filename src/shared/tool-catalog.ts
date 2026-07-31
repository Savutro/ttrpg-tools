export type ToolStatus = "available" | "candidate";

export interface ToolDefinition {
  name: string;
  description: string;
  icon: string;
  status: ToolStatus;
  href?: string;
}

export const tools: ToolDefinition[] = [
  {
    name: "Standeecrafter",
    description: "Turn character artwork into correctly sized, foldable paper miniatures arranged on printable A4 sheets.",
    icon: "♙",
    status: "available",
    href: "standee.html"
  },
  {
    name: "Encounter Board",
    description: "Run initiative, conditions, concentration, and round counters from one fast, table-friendly screen.",
    icon: "⚔",
    status: "candidate"
  },
  {
    name: "Token Smith",
    description: "Crop artwork into printable round tokens with borders, labels, and correctly sized A4 layouts.",
    icon: "◉",
    status: "candidate"
  },
  {
    name: "Session Sheet",
    description: "Create a concise, printable session reference from scenes, NPCs, clues, and secrets without becoming a campaign manager.",
    icon: "☷",
    status: "candidate"
  }
];
