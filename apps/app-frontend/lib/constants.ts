export const API_BASE_URL = "/v1";

export const ORG_ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export const ORG_ROLE_COLORS: Record<string, string> = {
  owner: "bg-primary/10 text-primary",
  admin: "bg-accent/10 text-accent-foreground",
  member: "bg-secondary text-secondary-foreground",
  viewer: "bg-muted text-muted-foreground",
};

export const VAULT_ITEM_TYPE_LABELS: Record<string, string> = {
  login: "Login",
  secure_note: "Secure Note",
  card: "Card",
  identity: "Identity",
};

export const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  standard: "Standard",
  pro: "Pro",
  enterprise: "Enterprise",
};
