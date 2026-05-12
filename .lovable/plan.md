# Plano de alterações

## 1. Controle de imagens (tamanho, recorte, enquadramento)
Criar novo componente `ImageFrame` (admin) que estende `ImageUpload`:
- Campos extras salvos junto com cada imagem como objeto `{ url, position, fit, ratio, size }`:
  - **position**: `object-position` ajustável via 2 sliders X/Y (0–100%) + preview ao vivo
  - **fit**: `cover` | `contain` (sem distorcer — nunca `fill`)
  - **ratio**: `auto` | `1:1` | `4:5` | `3:4` | `16:9` | `21:9`
  - **size**: `s` | `m` | `l` | `xl` (largura relativa no grid)
- Para a galeria (`gallery`), cada item passa de `string` para esse objeto. Compatibilidade retroativa: strings continuam funcionando (assumem defaults `cover`, centro, `auto`, `m`).
- Renderização pública via novo `<EditorialImage>` que aplica `aspect-ratio`, `object-fit`, `object-position` e `col-span` conforme `size`.

## 2. Grid editorial mais clean
Refatorar grids em `Projetos.tsx`, `ProjetoDetalhe.tsx`, `AtuacaoSocial.tsx`:
- Grid base 12 colunas, gap consistente (`gap-x-6 gap-y-16`)
- Tamanhos `s/m/l/xl` mapeiam para `col-span-{4,6,8,12}` em desktop; mobile sempre full
- Composição alterna automaticamente offsets (start-2, start-4) para respirar
- Mantém alinhamento à baseline tipográfica (sem cards/sombras decorativas)

## 3. Rich Text em todos os campos
- Criar variante `RichEditorMini` (mesma engine Tiptap, sem títulos/listas, toolbar compacta com fonte/tamanho/negrito/itálico/sublinhado/alinhamento/cor/link) para campos curtos: títulos, subtítulos, frases.
- Adicionar tipo `richtext-mini` no `ListManager` e usar em `AdminConfig` (hero_name, hero_subtitle, marquee palavras), `AdminLists` (cargo, empresa, instituição, organização, período, frase de destaque), `AdminProjetoEditor` (titulo, subtitulo, descricao_curta, cliente, papel, periodo).
- No frontend, esses campos passam a ser renderizados com `dangerouslySetInnerHTML` numa classe `prose-inline` (sem margens de bloco).
- Sanitização leve com `dompurify`.

## 4. Nova página "Sobre Mim"
- Rota `/sobre` adicionada ao `App.tsx` e ao `Navbar.tsx` (entre "Home" e "Projetos").
- Nova tabela `sobre_blocos` (jsonb-driven) ou reaproveitar `site_settings` com novo campo `sobre_blocos jsonb` (lista de blocos editoriais). Vou pelo segundo (menos schema novo).
- Tipos de bloco: `texto` (richtext largo), `imagem` (com size/ratio/position), `par-texto-imagem` (lado a lado, lado configurável), `frase-grande` (pull-quote display), `galeria` (2–3 col), `espaço` (vertical spacer).
- Página `Sobre.tsx` renderiza blocos na ordem, layout 12-col com offsets generosos, tipografia Fraunces gigante para frases, respiro vertical (`py-24`).
- Admin `AdminSobre.tsx`: editor de blocos drag-to-reorder, com formulário por tipo, usando `EditorialImage` controls e `RichEditor`.

## 5. Banco
Migration única:
- `ALTER TABLE site_settings ADD COLUMN sobre_blocos jsonb NOT NULL DEFAULT '[]'`
- `ALTER TABLE site_settings ADD COLUMN sobre_hero jsonb` (cover image com position)

## Arquivos principais
- novo: `src/components/admin/EditorialImage.tsx` (controls)
- novo: `src/components/site/EditorialImage.tsx` (display)
- novo: `src/components/admin/RichEditorMini.tsx`
- novo: `src/pages/Sobre.tsx`, `src/pages/admin/AdminSobre.tsx`
- editado: `ListManager`, `RichEditor` (extrair core), `Navbar`, `App`, `AdminLayout` sidebar, todas Admin pages, Projetos/ProjetoDetalhe/AtuacaoSocial (grid + EditorialImage).

## Ordem de execução
1. Migration `sobre_blocos`
2. `RichEditorMini` + sanitização
3. `EditorialImage` (admin + site)
4. Refator grids
5. Página Sobre + admin
6. Substituição RichEditor mini em todos campos curtos
7. QA visual