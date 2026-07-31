import { tools, type ToolDefinition } from "../shared/tool-catalog";

function createCard(tool: ToolDefinition): HTMLElement {
  const card = document.createElement(tool.href ? "a" : "article");
  card.className = `tool-card ${tool.status === "available" ? "available" : "forthcoming"}`;

  if (card instanceof HTMLAnchorElement && tool.href) card.href = tool.href;

  const icon = document.createElement("span");
  icon.className = "tool-icon";
  icon.ariaHidden = "true";
  icon.textContent = tool.icon;

  const status = document.createElement("span");
  status.className = "tool-status";
  status.textContent = tool.status === "available" ? "Available now" : "Tool candidate";

  const heading = document.createElement("h3");
  heading.textContent = tool.name;

  const description = document.createElement("p");
  description.textContent = tool.description;

  const action = document.createElement("span");
  action.className = "tool-action";
  action.textContent = tool.status === "available" ? "Open the forge →" : "On the roadmap";

  card.append(icon, status, heading, description, action);
  return card;
}

const catalog = document.querySelector<HTMLElement>("#toolCatalog");
if (!catalog) throw new Error("Tool catalog container not found.");
catalog.append(...tools.map(createCard));
