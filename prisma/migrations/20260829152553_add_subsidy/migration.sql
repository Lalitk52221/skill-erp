-- CreateTable
CREATE TABLE "Subsidy" (
    "id" TEXT NOT NULL,
    "feeStructureId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "letterUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subsidy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subsidy_feeStructureId_idx" ON "Subsidy"("feeStructureId");

-- AddForeignKey
ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "FeeStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
