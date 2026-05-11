# Plano de melhorias — portfólio Vanina

Baseado na referência https://chiaraluzzana.com/work/lavazza (layout editorial, blocos alternados de texto+imagem, frases destaque, galerias livres).

---

## Fase 1 — Correções rápidas (entregar primeiro)

### 1. Imagem do hero não troca mais por outra
- Remover o `import heroImg from "@/assets/hero-portrait.jpg"` como fallback no `Index.tsx`.
- Enquanto a configuração carrega, mostrar área neutra (cor sólida do design system), não outra foto.
- Adicionar `loading="eager"` + `fetchpriority="high"` na imagem real e fade-in suave quando carregar.

### 2. Menu ganha "Atuação Social"
- Adicionar item no `Navbar.tsx`: Home · Projetos · Atuação Social · Contato.
- Rota nova `/atuacao-social` (página dedicada — ver Fase 2).

### 3. Scroll mais fluido
- Remover `scroll-behavior: smooth` global do CSS (entra em conflito com `framer-motion useScroll` do hero).
- Trocar parallax do hero por transform mais leve (ou desativar em mobile via `useReducedMotion`).
- `will-change` apenas onde necessário; remover de elementos estáticos.

### 4. Layout "Trajetória profissional" redistribuído
Novo grid (12 colunas):
```
[ ano · 2 col ] [ cargo · 4 col ] [ descrição rica · 6 col ]
                [ empresa abaixo do ano ]
```
Empresa fica **abaixo do ano** (coluna esquerda), liberando 6 colunas inteiras para a descrição.

---

## Fase 2 — Editor universal + páginas editoriais

### 5. RichEditor expandido (font size + font family)
Adicionar ao `RichEditor.tsx`:
- Extensão `@tiptap/extension-font-family` (Fraunces / Inter / serif / sans / mono).
- Extensão `@tiptap/extension-text-style` + custom mark de tamanho (12 / 14 / 16 / 18 / 24 / 32 / 48 px).
- Dropdowns no toolbar (família + tamanho), além dos botões já existentes (B / I / U / alinhamento / listas / link / imagem / títulos).

### 6. RichEditor em **todos** os campos de texto
Substituir `<Textarea>` e `<Input>` longos por `<RichEditor>` em:
- `AdminConfig.tsx`: `hero_intro`, `about_text`, `contact_intro`.
- `AdminContato.tsx`: textos auxiliares.
- `ListManager` (formacoes, experiencias, voluntariados): campo `descricao` vira rich text.
- `AdminProjetoEditor.tsx`: `descricao_curta` vira rich text.

E nas páginas públicas, renderizar via `dangerouslySetInnerHTML` com a classe `prose-editorial` (já existe no `index.css`).

### 7. Atuação Social — nova página `/atuacao-social`
Layout editorial (estilo Chiara/Lavazza):
- Hero com título grande + intro.
- Cards atuais expandem ("Ver mais") OU cada voluntariado abre página `/atuacao-social/:slug` com:
  - Texto longo (rich text)
  - Galeria de fotos
  - Frases de destaque grandes (pull-quotes)
  - Blocos texto+imagem alternados (esquerda/direita)

**Schema novo na tabela `voluntariados`:**
- `slug` (text, unique)
- `cover_url` (text)
- `galeria` (jsonb, default `[]`)
- `conteudo` (text, HTML rich)
- `destaque` (text — frase grande)

### 8. Projetos — detalhe editorial livre
Refatorar `ProjetoDetalhe.tsx` para layout livre (mesmo espírito da referência):
- Cover full-bleed.
- Blocos: texto largo, imagem grande, par texto+imagem, galeria de 2/3 colunas, frase destaque.
- Ordem e composição dos blocos definida no admin via novo campo `blocos` (jsonb com tipo + conteúdo) — editor visual de blocos no `AdminProjetoEditor`.

**Schema novo em `projetos`:**
- `blocos` (jsonb, default `[]`) — array de `{ tipo: 'texto' | 'imagem' | 'par' | 'galeria' | 'destaque' | 'video', conteudo, ... }`.

(O conteúdo livre antigo continua funcionando como fallback.)

### 9. Atualizar admin de Voluntariados
- `ListManager` ganha capa, galeria, slug, conteúdo rico e frase destaque para voluntariados.

---

## Detalhes técnicos

- **Migrations** necessárias (Fase 2): adicionar colunas em `voluntariados` e `projetos` + RLS já existente cobre.
- **Dependências novas**: `@tiptap/extension-font-family`, `@tiptap/extension-text-style`, `@tiptap/extension-font-size` (ou mark customizada).
- **Performance scroll**: medir com `browser--performance_profile` antes/depois.
- **Sanitização HTML**: usar `dompurify` antes de injetar HTML do CMS nas páginas públicas.

---

## Ordem de execução sugerida

1. Aprovar este plano.
2. Implementar Fase 1 inteira (1 mensagem).
3. Validar visualmente.
4. Implementar Fase 2 — começa por migrations (precisam aprovação separada), depois código.

Posso começar pela Fase 1 assim que você aprovar?
