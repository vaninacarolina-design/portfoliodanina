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
      { key: "descricao", label: "Descrição", type: "textarea" },
      { key: "anexos", label: "Arquivos / fotos (certificados, diplomas)", type: "files" },
    ]}
  />
);

export const AdminExperiencias = () => (
  <ListManager table="experiencias" title="Experiências" fields={[
    { key: "cargo", label: "Cargo" },
    { key: "empresa", label: "Empresa" },
    { key: "periodo", label: "Período" },
    { key: "descricao", label: "Descrição", type: "textarea" },
  ]} />
);

export const AdminVoluntariados = () => (
  <ListManager table="voluntariados" title="Voluntariado" fields={[
    { key: "titulo", label: "Atividade" },
    { key: "organizacao", label: "Organização" },
    { key: "periodo", label: "Período" },
    { key: "descricao", label: "Descrição", type: "textarea" },
  ]} />
);
