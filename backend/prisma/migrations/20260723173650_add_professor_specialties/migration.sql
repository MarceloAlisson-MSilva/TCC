-- CreateTable
CREATE TABLE "especialidades_professor" (
    "professor_id" INTEGER NOT NULL,
    "caminho_final_id" INTEGER NOT NULL,

    CONSTRAINT "especialidades_professor_pkey" PRIMARY KEY ("professor_id","caminho_final_id")
);

-- AddForeignKey
ALTER TABLE "especialidades_professor" ADD CONSTRAINT "especialidades_professor_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "detalhes_professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "especialidades_professor" ADD CONSTRAINT "especialidades_professor_caminho_final_id_fkey" FOREIGN KEY ("caminho_final_id") REFERENCES "caminhos_finais_fluxo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
