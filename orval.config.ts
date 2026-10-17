import { defineConfig } from 'orval'

// O backend serve o contrato em /api-json (SwaggerModule com jsonDocumentUrl
// 'api-json' em src/main.ts). Para gerar contra um backend local ou contra um
// openapi.json versionado, sobrescreva com ORVAL_OPENAPI_URL.
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.wepartyapp.com'

export default defineConfig({
  wePartyApi: {
    input: {
      target: process.env.ORVAL_OPENAPI_URL ?? 'https://api.wepartyapp.com/api-json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/lib/api',
      schemas: 'src/lib/api/model',
      client: 'react-query',
      httpClient: 'axios',
      baseUrl: apiBaseUrl,
      override: {
        mutator: {
          path: 'src/lib/axios.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
})
