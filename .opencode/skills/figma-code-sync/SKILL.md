---
name: figma-code-sync
description: Mantém Figma, código e Storybook em sincronia (We Party). Use ao criar/alterar qualquer componente ou tela de UI, ou quando o Figma mudar.
license: MIT
compatibility: Requer acesso ao arquivo Figma "Venus Design" (MCP do Figma) e ao Storybook do projeto.
metadata:
  author: we-tech
  version: "1.0"
---

Regra do projeto (AGENTS.md › "Design System: Figma ↔ código ↔ Storybook"): **mudou de um lado, muda do outro na mesma tarefa.**

## Passos
1. **Identifique o par.** Componente no código ⇒ nó no Figma (página *Componentes*; nomes iguais). Tela ⇒ frame na página *CMS Desktop/Mobile* (ou *Web App*). Consulte `docs/DESIGN_SYSTEM.md` (tabela de mapeamento).
2. **Código → Figma** (você mexeu no código): atualize o componente no Figma (`use_figma`): variantes, propriedades, tokens; atualize a ficha em *Componentes* (descrição, uso, código, tokens, a11y) e a cobertura em *Design System › 07*.
3. **Figma → código** (o Figma mudou): leia o nó (`get_design_context`/`get_screenshot`), ajuste o componente e os tokens (`globals.css`), atualize a story.
4. **Story.** Todo componente de `ui/` e `cms/` tem `*.stories.tsx` com todas as variantes do Figma e `parameters.design` (`figmaNode('<id>')`). Rode `yarn storybook`.
5. **Compare visualmente** story × Figma (mesmo tamanho). Diferença de pixel é bug.
6. **Registre no PR**: o que mudou em cada lado; pendências viram tarefa.

## Nunca
- Hex/medida solta em componente: use os tokens `--wp-*` / classes Tailwind mapeadas.
- Criar componente novo sem checar `src/components/{ui,cms}` (regra de reuso).
- Fechar tarefa de UI sem story e sem cobertura em `weparty-automation`.
