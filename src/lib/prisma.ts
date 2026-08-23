import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  initializedSchema?: boolean;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let schemaInitializationPromise: Promise<void> | null = null;

/**
 * Auto-heal: Asegura que la tabla LeadProposal y sus índices existan en la BD
 * incluso si el contenedor en producción (Dokploy) no ejecutó 'prisma db push' previamente.
 */
export async function ensureDatabaseSchema() {
  if (globalForPrisma.initializedSchema) return;
  if (schemaInitializationPromise) return schemaInitializationPromise;

  schemaInitializationPromise = (async () => {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "public"."LeadProposal" (
            "id" TEXT NOT NULL,
            "leadId" TEXT NOT NULL,
            "painDiagnosis" TEXT NOT NULL,
            "transformationGoal" TEXT NOT NULL,
            "pilar1Leads" TEXT NOT NULL,
            "pilar2Conversion" TEXT NOT NULL,
            "pilar3Automation" TEXT NOT NULL,
            "whatsappPitch" TEXT NOT NULL,
            "coldEmailPitch" TEXT NOT NULL,
            "callScript" TEXT NOT NULL,
            "isCustomized" BOOLEAN NOT NULL DEFAULT false,
            "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "LeadProposal_pkey" PRIMARY KEY ("id")
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "LeadProposal_leadId_key" ON "public"."LeadProposal"("leadId");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "LeadProposal_leadId_idx" ON "public"."LeadProposal"("leadId");
      `);

      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'LeadProposal_leadId_fkey'
            ) THEN
                ALTER TABLE "public"."LeadProposal" ADD CONSTRAINT "LeadProposal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;
        END $$;
      `);

      globalForPrisma.initializedSchema = true;
    } catch (error: unknown) {
      console.warn(
        'Advertencia en auto-inicialización de esquema Prisma:',
        error instanceof Error ? error.message : error
      );
    } finally {
      schemaInitializationPromise = null;
    }
  })();

  return schemaInitializationPromise;
}

export default prisma;
