import { defineConfig } from 'orval'

export default defineConfig({
  wePartyApi: {
    input: {
      target: 'https://api.dev.wepartyapp.com/api-docs-json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/lib/api',
      schemas: 'src/lib/api/model',
      client: 'react-query',
      httpClient: 'axios',
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.dev.wepartyapp.com',
      override: {
        mutator: {
          path: 'src/lib/axios.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
})
