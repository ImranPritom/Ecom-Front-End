import prisma from "@/app/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod schema
const SupplierSchema = z.object({
  supplier_name: z.string().min(1, "Supplier name is required"),
  supplier_email: z
    .string()
    .email("Invalid email address")
    .min(1, "Supplier email is required"),
  supplier_phone_number: z.string().min(1, "Supplier phone number is required"),
  supplier_country: z.string().optional(),
  supplier_city: z.string().min(1, "Supplier city is required"),
  supplier_company_name: z.string().min(1, "Supplier company name is required"),
  supplier_address: z.string().min(1, "Supplier address is required"),
});

type SupplierBodyData = z.infer<typeof SupplierSchema>;

// ✅ Utility function to check authentication & role
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

// ✅ DELETE Supplier
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  const { token, error } = await checkAuth(req);
  if (error) return error;

  const id = Number((await params).id);
  if (isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid supplier ID" },
      { status: 400 }
    );
  }

  try {
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
      select: { id: true, supplier_name: true },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { message: "No supplier found to delete" },
        { status: 404 }
      );
    }

    await prisma.supplier.delete({ where: { id } });

    return NextResponse.json(
      { message: "Supplier deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { message: "Error deleting supplier" },
      { status: 500 }
    );
  }
}

// ✅ GET Supplier by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  const { token, error } = await checkAuth(req);
  if (error) return error;

  const id = Number((await params).id);
  if (isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid supplier ID" },
      { status: 400 }
    );
  }

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      select: {
        id: true,
        supplier_name: true,
        supplier_email: true,
        supplier_phone_number: true,
        supplier_country: true,
        supplier_city: true,
        supplier_address: true,
        supplier_company_name: true,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { message: "No supplier found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "success", data: supplier },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { message: "Error fetching supplier" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE Supplier
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  const { token, error } = await checkAuth(req);
  if (error) return error;

  const id = Number((await params).id);
  if (isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid supplier ID" },
      { status: 400 }
    );
  }

  let bodyData: SupplierBodyData;
  try {
    const jsonData = await req.json();
    bodyData = SupplierSchema.parse(jsonData);
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
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { message: "No supplier found to update" },
        { status: 404 }
      );
    }

    await prisma.supplier.update({
      where: { id },
      data: {
        ...bodyData,
        supplier_country: bodyData.supplier_country || "Bangladesh",
      },
    });

    return NextResponse.json(
      { message: "Supplier updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update supplier:", error);
    return NextResponse.json(
      { message: "Failed to update supplier" },
      { status: 500 }
    );
  }
}
