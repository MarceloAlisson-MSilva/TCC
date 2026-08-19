-- A tabela "mensagens_chat" foi criada por uma versão antiga do model Mensagem
-- (colunas: projeto_tcc_id, emissor_id, conteudo_texto, midia_url, enviado_em) e nunca
-- foi migrada quando o schema.prisma foi atualizado para o model atual, que mapeia
-- para a tabela "mensagens" com colunas diferentes (projeto_id, autor_id, conteudo, criado_em).
-- Isso fazia o Prisma tentar gravar numa tabela "mensagens" que nunca existiu no banco,
-- causando erro 500 ao enviar mensagem no chat.

DROP TABLE IF EXISTS "mensagens_chat";

CREATE TABLE "mensagens" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "autor_id" INTEGER NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" "TipoMensagem" NOT NULL DEFAULT 'TEXTO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos_tcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
