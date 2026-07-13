import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { databaseProspectToClient } from "@/lib/prospect-mapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prospects = await prisma.prospect.findMany({
      orderBy: [
        {
          status: "asc",
        },
        {
          followersCount: "desc",
        },
      ],
    });

    return NextResponse.json({
      prospects: prospects.map(databaseProspectToClient),
      total: prospects.length,
    });
  } catch (error) {
    console.error("Erro ao buscar prospects:", error);

    return NextResponse.json(
      {
        error: "Não foi possível carregar os prospects.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE() {
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const deletedProspects =
        await transaction.prospect.deleteMany();

      await transaction.prospectImport.deleteMany();

      return deletedProspects.count;
    });

    return NextResponse.json({
      success: true,
      deletedProspects: result,
    });
  } catch (error) {
    console.error("Erro ao limpar base:", error);

    return NextResponse.json(
      {
        error: "Não foi possível limpar a base.",
      },
      {
        status: 500,
      },
    );
  }
}