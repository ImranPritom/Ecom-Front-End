import prisma from "@/app/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || !token.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const adminId = Number(token.id);
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
  const query = url.searchParams.get("query")?.trim().toLowerCase() || "";
  const offset = (page - 1) * pageSize;

  try {
    // Build where condition
    const whereCondition = {
      user_id: adminId,
      product_name: {
        contains: query,
        mode: "insensitive" as Prisma.QueryMode,
      },
    };

    // Total count
    const totalProducts = await prisma.product.count({
      where: whereCondition,
    });

    // Fetch products with relations and images
    const products = await prisma.product.findMany({
      where: whereCondition,
      select: {
        id: true,
        product_name: true,
        price: true,
        stock: true,
        is_featured: true,
        is_new_arrival: true,
        status: true,
        shipping_cost: true,
        sale_price: true,
        supplier: {
          select: {
            supplier_name: true,
          },
        },
        category: {
          select: {
            category_name: true,
          },
        },
        brand: {
          select: {
            brand_name: true,
          },
        },
        product_image: {
          select: {
            image_url: true,
          },
        },
        created_at: true,
      },
      skip: offset,
      take: pageSize,
      orderBy: {
        product_name: "asc",
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      product_name: product.product_name,
      brand_name: product.brand?.brand_name ?? null,
      price: product.price.toNumber(),
      stock: product.stock,
      status: product.status,
      image_url: product.product_image.map((img) => img.image_url),
      created_at: product.created_at.toISOString(),
    }));

    const totalPages = Math.ceil(totalProducts / pageSize);

    return NextResponse.json({
      message: "success",
      data: formattedProducts,
      pagination: {
        currentPage: page,
        pageSize,
        totalProducts,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Error fetching products" },
      { status: 500 }
    );
  }
}
