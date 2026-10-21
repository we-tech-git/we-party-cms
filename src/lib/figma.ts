/**
 * Link para um nó do Figma (arquivo "Venus Design"). Usado em `parameters.design` das stories:
 * cada componente do Storybook aponta para o seu equivalente na página "Componentes" / "Design System".
 * REGRA (AGENTS.md): mudou o componente aqui => atualizar o Figma; mudou no Figma => atualizar aqui.
 */
export const FIGMA_FILE = 'https://www.figma.com/design/t1c81uJHIFKBn7Kfy8PRAC/Venus-Design'

export const figmaNode = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(':', '-')}`
