import packageJson from "../package.json"

export const backend     = import.meta.env.VITE_BACKEND     ?? "http://localhost:8000"
export const frontend    = import.meta.env.VITE_FRONTEND    ?? "http://localhost:3000"
export const api_prefix  = import.meta.env.VITE_API_PREFIX  ?? "/api/"
export const static_dir  = import.meta.env.VITE_STATIC_DIR  ?? "/"
export const debug       = import.meta.env.DEV
export const version     = packageJson.version
export const github_repo = import.meta.env.VITE_GITHUB_REPO ?? "moeezraza35/OBMMS"
