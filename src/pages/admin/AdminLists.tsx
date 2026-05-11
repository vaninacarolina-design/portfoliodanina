import { ListManager } from "@/components/admin/ListManager";

export const AdminFormacoes = () => (
  <ListManager
    table="formacoes"
    title="Formações"
    autoSortByDate="data_conclusao"
    fields={[
      { key: "titulo", label: "Título / Curso" },
      { key: "instituicao", label: "Instituição" },
      { key: "data_conclusao", label: "Data de conclusão", type: "date" },
      { key: "periodo", label: "Período (texto exibido)" },
      { key: "descricao", label: "Descrição", type: "richtext" },
      { key: "anexos", label: "Arquivos / fotos (certificados, diplomas)", type: "files" },
    ]}
  />
);

export const AdminExperiencias = () => (
  <ListManager table="experiencias" title="Experiências" fields={[
    { key: "cargo", label: "Cargo" },
    { key: "empresa", label: "Empresa" },
    { key: "periodo", label: "Período" },
    { key: "descricao", label: "Descrição", type: "richtext" },
  ]} />
);

export const AdminVoluntariados = () => (
  <ListManager table="voluntariados" title="Atuação Social" fields={[
    { key: "titulo", label: "Atividade" },
    { key: "organizacao", label: "Organização" },
    { key: "periodo", label: "Período" },
    { key: "cover_url", label: "Imagem de capa", type: "image" },
    { key: "destaque", label: "Frase de destaque (pull-quote)" },
    { key: "descricao", label: "Resumo curto", type: "textarea" },
    { key: "conteudo", label: "Conteúdo completo (texto editorial)", type: "richtext" },
    { key: "galeria", label: "Galeria de fotos", type: "gallery" },
  ]} />
);
