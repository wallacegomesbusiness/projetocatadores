-- CreateTable
CREATE TABLE "Catador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ativo',

    CONSTRAINT "Catador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "precoPorKg" DOUBLE PRECISION NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'kg',

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coleta" (
    "id" TEXT NOT NULL,
    "catadorId" TEXT NOT NULL,
    "dataColeta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valorTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Coleta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemColeta" (
    "id" TEXT NOT NULL,
    "coletaId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemColeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "catadorId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "referenciaMesAno" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Catador_cpf_key" ON "Catador"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Coleta" ADD CONSTRAINT "Coleta_catadorId_fkey" FOREIGN KEY ("catadorId") REFERENCES "Catador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemColeta" ADD CONSTRAINT "ItemColeta_coletaId_fkey" FOREIGN KEY ("coletaId") REFERENCES "Coleta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemColeta" ADD CONSTRAINT "ItemColeta_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_catadorId_fkey" FOREIGN KEY ("catadorId") REFERENCES "Catador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
