/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  //  les variables d'environnement VITE 
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
