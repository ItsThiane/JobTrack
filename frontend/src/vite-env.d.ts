/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Déclarez ici toutes les variables d'environnement VITE que vous utilisez
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
