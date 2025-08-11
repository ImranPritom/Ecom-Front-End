import prisma from "@/app/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ✅ Zod schema for category update
const CategorySchema = z.object({
  category_name: z.string().min(1, "Category name is required"),
});

// ✅ Auth & role check helper
async function checkAuth(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || !token.id) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
  if (token.role !== "admin") {
    return {
      error: NextResponse.json(
        { message: "Forbidden Resource" },
        { status: 403 }
      ),
    };
  }
  return { token };
}

// ✅ DELETE Category (Prisma ORM)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  const { error } = await checkAuth(req);
  if (error) return error;

  const id = Number((await params).id);

  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: id },
      select: { id: true, category_name: true },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: "No category found to delete" },
        { status: 404 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { message: "Error deleting category" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE Category (Prisma ORM)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  const { error } = await checkAuth(req);
  if (error) return error;

  const id = Number((await params).id);

  let data;
  try {
    const body = await req.json();
    data = CategorySchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: id },
      select: { id: true },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: "No category found to update" },
        { status: 404 }
      );
    }

    await prisma.category.update({
      where: { id },
      data: { category_name: data.category_name },
    });

    return NextResponse.json(
      { message: "Category updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { message: "Error updating category" },
      { status: 500 }
    );
  }
}
