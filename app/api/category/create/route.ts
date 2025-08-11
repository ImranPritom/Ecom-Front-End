import { uploadImage } from "@/app/lib/cloudinary";
import prisma from "@/app/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

interface Category {
  id: string;
  category_name: string;
}

export async function POST(req: NextRequest) {
  // Extract token from the request
  const token = await getToken({ req });

  // Validate token
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  //role
  const role = token.role;
  if (role !== "admin") {
    return NextResponse.json(
      {
        message: "Forbidden Resource",
      },
      {
        status: 403,
      }
    );
  }

  const adminId = token.id;

  if (!adminId) {
    return NextResponse.json(
      { message: "Unauthorized: Missing user ID in token" },
      { status: 401 }
    );
  }

  //parse body data
  const bodyData = await req.json();
  const { category_name } = bodyData;
  const { category_image_url } = bodyData;

  //category name and url required
  if (!category_name) {
    return NextResponse.json(
      { message: "Category name is required" },
      { status: 400 }
    );
  }
  if (!category_image_url) {
    return NextResponse.json(
      { message: "Category image is required" },
      { status: 400 }
    );
  }

  //check category exist or not
  const checkCategory: Category[] = await checkCategoryExist(category_name);
  if (checkCategory.length > 0) {
    return NextResponse.json(
      {
        message: "Category name exist",
      },
      {
        status: 400,
      }
    );
  }

  let imageUrl: string = "";
  if (category_image_url) {
    try {
      imageUrl = await uploadImage(category_image_url, "categories");
    } catch (error) {
      return NextResponse.json(
        {
          message: "Failed to upload image",
        },
        {
          status: 400,
        }
      );
    }
  }

  try {
    await prisma.$queryRaw`
      INSERT INTO category(category_name , category_image_url, user_id)
      VALUES(${category_name} , ${imageUrl} , ${adminId})
    `;

    return NextResponse.json(
      {
        message: "Category created success",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error creating category",
      },
      {
        status: 500,
      }
    );
  }
  return NextResponse.json({
    message: "Hello create",
    category_name,
    category_image_url,
  });
}

//helperr function to check if category exist
async function checkCategoryExist(category_name: string): Promise<Category[]> {
  const formatCategoryName = category_name.toLowerCase();

  return await prisma.$queryRaw`
    SELECT id,category_name
    FROM category
    WHERE LOWER(category.category_name)=${formatCategoryName}
  `;
}
