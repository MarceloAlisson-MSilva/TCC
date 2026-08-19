-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ALUNO', 'PROFESSOR');

-- CreateEnum
CREATE TYPE "StatusTCC" AS ENUM ('ONBOARDING', 'EM_ANDAMENTO', 'AGUARDANDO_AVALIACAO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "TipoMensagem" AS ENUM ('TEXTO', 'ARQUIVO', 'AUDIO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL,
    "curso" VARCHAR(100),
    "fotoUrl" VARCHAR(255) NOT NULL DEFAULT 'default_avatar.png',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalhes_professor" (
    "id" SERIAL NOT NULL,
    "professor_id" INTEGER NOT NULL,
    "vagas_totais" INTEGER NOT NULL DEFAULT 5,
    "vagas_ocupadas" INTEGER NOT NULL DEFAULT 0,
    "biografia" TEXT,

    CONSTRAINT "detalhes_professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates_tcc" (
    "id" SERIAL NOT NULL,
    "nome_template" VARCHAR(150) NOT NULL,
    "descricao" TEXT,
    "arquivo_url" VARCHAR(255) NOT NULL,

    CONSTRAINT "templates_tcc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caminhos_finais_fluxo" (
    "id" SERIAL NOT NULL,
    "codigo_ramificacao" VARCHAR(50) NOT NULL,
    "template_id" INTEGER NOT NULL,

    CONSTRAINT "caminhos_finais_fluxo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exemplos_temas" (
    "id" SERIAL NOT NULL,
    "caminho_final_id" INTEGER NOT NULL,
    "texto_exemplo_tema" TEXT NOT NULL,

    CONSTRAINT "exemplos_temas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projetos_tcc" (
    "id" SERIAL NOT NULL,
    "aluno_id" INTEGER NOT NULL,
    "professor_id" INTEGER,
    "titulo" VARCHAR(255) NOT NULL DEFAULT 'Tema em Definição',
    "descricao" TEXT,
    "status" "StatusTCC" NOT NULL DEFAULT 'ONBOARDING',
    "template_sugerido_id" INTEGER,
    "criated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projetos_tcc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perguntas_quiz" (
    "id" SERIAL NOT NULL,
    "texto_pergunta" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "perguntas_quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opcoes_quiz" (
    "id" SERIAL NOT NULL,
    "pergunta_id" INTEGER NOT NULL,
    "texto_opcao" TEXT NOT NULL,
    "proxima_pergunta_id" INTEGER,
    "caminho_final_id" INTEGER,

    CONSTRAINT "opcoes_quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas_aluno_quiz" (
    "id" SERIAL NOT NULL,
    "aluno_id" INTEGER NOT NULL,
    "opcao_id" INTEGER NOT NULL,

    CONSTRAINT "respostas_aluno_quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulos" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aulas_texto" (
    "id" SERIAL NOT NULL,
    "modulo_id" INTEGER NOT NULL,
    "titulo_aula" VARCHAR(150) NOT NULL,
    "conteudo_escrito" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "aulas_texto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progresso_aulas" (
    "aluno_id" INTEGER NOT NULL,
    "aula_id" INTEGER NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "progresso_aulas_pkey" PRIMARY KEY ("aluno_id","aula_id")
);

-- CreateTable
CREATE TABLE "mensagens_chat" (
    "id" SERIAL NOT NULL,
    "projeto_tcc_id" INTEGER NOT NULL,
    "emissor_id" INTEGER NOT NULL,
    "tipo" "TipoMensagem" NOT NULL DEFAULT 'TEXTO',
    "conteudo_texto" TEXT,
    "midia_url" VARCHAR(255),
    "enviado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "detalhes_professor_professor_id_key" ON "detalhes_professor"("professor_id");

-- CreateIndex
CREATE UNIQUE INDEX "caminhos_finais_fluxo_codigo_ramificacao_key" ON "caminhos_finais_fluxo"("codigo_ramificacao");

-- CreateIndex
CREATE UNIQUE INDEX "projetos_tcc_aluno_id_key" ON "projetos_tcc"("aluno_id");

-- CreateIndex
CREATE UNIQUE INDEX "perguntas_quiz_ordem_key" ON "perguntas_quiz"("ordem");

-- CreateIndex
CREATE UNIQUE INDEX "respostas_aluno_quiz_aluno_id_opcao_id_key" ON "respostas_aluno_quiz"("aluno_id", "opcao_id");

-- CreateIndex
CREATE UNIQUE INDEX "modulos_ordem_key" ON "modulos"("ordem");

-- AddForeignKey
ALTER TABLE "detalhes_professor" ADD CONSTRAINT "detalhes_professor_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caminhos_finais_fluxo" ADD CONSTRAINT "caminhos_finais_fluxo_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates_tcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exemplos_temas" ADD CONSTRAINT "exemplos_temas_caminho_final_id_fkey" FOREIGN KEY ("caminho_final_id") REFERENCES "caminhos_finais_fluxo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projetos_tcc" ADD CONSTRAINT "projetos_tcc_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projetos_tcc" ADD CONSTRAINT "projetos_tcc_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projetos_tcc" ADD CONSTRAINT "projetos_tcc_template_sugerido_id_fkey" FOREIGN KEY ("template_sugerido_id") REFERENCES "templates_tcc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcoes_quiz" ADD CONSTRAINT "opcoes_quiz_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "perguntas_quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcoes_quiz" ADD CONSTRAINT "opcoes_quiz_proxima_pergunta_id_fkey" FOREIGN KEY ("proxima_pergunta_id") REFERENCES "perguntas_quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcoes_quiz" ADD CONSTRAINT "opcoes_quiz_caminho_final_id_fkey" FOREIGN KEY ("caminho_final_id") REFERENCES "caminhos_finais_fluxo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_aluno_quiz" ADD CONSTRAINT "respostas_aluno_quiz_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_aluno_quiz" ADD CONSTRAINT "respostas_aluno_quiz_opcao_id_fkey" FOREIGN KEY ("opcao_id") REFERENCES "opcoes_quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aulas_texto" ADD CONSTRAINT "aulas_texto_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_aulas" ADD CONSTRAINT "progresso_aulas_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_aulas" ADD CONSTRAINT "progresso_aulas_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aulas_texto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_chat" ADD CONSTRAINT "mensagens_chat_projeto_tcc_id_fkey" FOREIGN KEY ("projeto_tcc_id") REFERENCES "projetos_tcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_chat" ADD CONSTRAINT "mensagens_chat_emissor_id_fkey" FOREIGN KEY ("emissor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
