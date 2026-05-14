import { ListManager } from "@/components/admin/ListManager";

export const AdminFormacoes = () => (
  <ListManager
    table="formacoes"
    title="Formações"
    fields={[
      { key: "titulo", label: "Título / Curso", type: "richtext-mini" },
      { key: "instituicao", label: "Instituição", type: "richtext-mini" },
      { key: "data_conclusao", label: "Data de conclusão", type: "date" },
      { key: "periodo", label: "Período (texto exibido)", type: "richtext-mini" },
      { key: "descricao", label: "Descrição", type: "richtext" },
      { key: "anexos", label: "Arquivos / fotos (certificados, diplomas)", type: "files" },
    ]}
  />
);

export const AdminExperiencias = () => (
  <ListManager table="experiencias" title="Experiências" fields={[
    { key: "cargo", label: "Cargo", type: "richtext-mini" },
    { key: "empresa", label: "Empresa", type: "richtext-mini" },
    { key: "periodo", label: "Período", type: "richtext-mini" },
    { key: "descricao", label: "Descrição", type: "richtext" },
  ]} />
);

export const AdminVoluntariados = () => (
  <ListManager table="voluntariados" title="Atuação Social" fields={[
    { key: "titulo", label: "Atividade", type: "richtext-mini" },
    { key: "organizacao", label: "Organização", type: "richtext-mini" },
    { key: "periodo", label: "Período", type: "richtext-mini" },
    { key: "cover_url", label: "Imagem de capa", type: "image" },
    { key: "destaque", label: "Frase de destaque (pull-quote)", type: "richtext-mini" },
    { key: "descricao", label: "Resumo curto", type: "textarea" },
    { key: "conteudo", label: "Conteúdo completo (texto editorial)", type: "richtext" },
    { key: "link_url", label: "Link externo (opcional)", type: "url" },
    { key: "galeria", label: "Galeria de fotos", type: "gallery" },
  ]} />
);
