export type DatabaseProvider = "aws" | "supabase" | "firebase" | "custom";

export type DatabaseConfig = {
  enabled: boolean;
  provider: DatabaseProvider;
  endpoint: string;
  projectId: string;
  publicKey: string;
};

export const DATABASE_CONFIG: DatabaseConfig = {
  enabled: true,
  provider: "supabase",
  endpoint: "https://ogwdqjqwbjyygpuqrmyf.supabase.co",
  projectId: "ogwdqjqwbjyygpuqrmyf",
  publicKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd2RxanF3Ymp5eWdwdXFybXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjM0MDAsImV4cCI6MjA5ODgzOTQwMH0.SzpYMny4YJgX0A5p_CRGSOzqaZxgdNPIqRUOAtwpcAs",
};

export function isDatabaseConfigured() {
  const endpoint = DATABASE_CONFIG.endpoint.trim();
  const publicKey = DATABASE_CONFIG.publicKey.trim();

  return (
    DATABASE_CONFIG.enabled &&
    DATABASE_CONFIG.provider === "supabase" &&
    endpoint.startsWith("https://") &&
    publicKey.length > 0 &&
    !endpoint.includes("your-project-ref") &&
    !publicKey.includes("your-supabase-anon-public-key")
  );
}
