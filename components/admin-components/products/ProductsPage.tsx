"use client";

import { getProducts } from "@/services/product-api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner, FaRegImage } from "react-icons/fa";
import { PiPencilSimpleLineDuotone, PiTrashDuotone } from "react-icons/pi";
import Image from "next/image";
import PaginationComponent from "../pagination/Pagination";
import { FiFilter } from "react-icons/fi";
import FilterSidebar from "./ProductsFilter";

interface ProductData {
  id: number;
  product_name: string;
  brand_name: string;
  price: number;
  stock: number;
  created_at: string;
  image_url: string[];
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
}

export default function ProductsPage() {
  //router
  const router = useRouter();
  //pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [query, setQuery] = useState<string>("");

  //get all products api
  const { data, isLoading } = useQuery({
    queryKey: ["products", currentPage, pageSize, query],
    queryFn: () => getProducts(currentPage, pageSize, query),
  });

  //total pages for pagination
  const totalPaginationPages = data?.pagination.totalPages;

  // Handle pagination and page size changes
  const onPageChange = (
    action: "next" | "previous" | "pageSize",
    value?: number
  ) => {
    if (action === "next") {
      setCurrentPage((prevPage) =>
        Math.min(prevPage + 1, totalPaginationPages)
      );
    } else if (action === "previous") {
      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    } else if (action === "pageSize" && value !== undefined) {
      setPageSize(value);
      setCurrentPage(1);
    }
  };

  //table search
  const querySearch = (query: string) => {
    setQuery(query);
  };

  //get status badge color
  const getStatusBadge = (status: ProductData["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-green-500";
      case "INACTIVE":
        return "bg-yellow-100 text-yellow-500";
      case "OUT_OF_STOCK":
        return "bg-red-100 text-red-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  // State to manage the visibility of the filter sidebar
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  //table columns
  const tableHeaderColumn = [
    {
      id: 1,
      column: "Product",
    },
    {
      id: 2,
      column: "Name",
    },
    {
      id: 3,
      column: "Brand",
    },
    {
      id: 4,
      column: "Price",
    },
    {
      id: 5,
      column: "Stock",
    },
    {
      id: 6,
      column: "Status",
    },
    {
      id: 7,
      column: "Created On",
    },
  ];

  return (
    <div className="max-w-full mx-auto p-2">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6">
        <input
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            querySearch(event.target.value)
          }
          type="search"
          className="px-4 py-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 max-w-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition duration-300"
          placeholder="Search"
        />
        <div className="flex gap-4 justify-end w-full">
          <button
            onClick={() => setIsFilterSidebarOpen(true)}
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-textdark3 hover:bg-gray-100 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <FiFilter className="w-5 h-5" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <button
            onClick={() => router.push("/admin/products/create")}
            className="bg-primary w-full sm:w-1/2 md:w-1/4 lg:w-40 text-white px-5 py-2.5 rounded-md shadow-md hover:bg-primary/95 transition"
          >
            + Add Product
          </button>
        </div>
      </header>
      {/* Main Section */}
      <main className="bg-white p-6 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold text-textdark2 mb-4">Products</h2>
        {/* Table Container */}
        {isLoading ? (
          <div className="flex justify-center items-center mx-auto w-full h-3/6">
            <FaSpinner size={20} className="animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-md overflow-hidden">
              <thead>
                <tr className="bg-primary text-white">
                  {tableHeaderColumn.map(
                    (tableHeaderData: { column: string; id: number }) => (
                      <th
                        className="px-6 py-3 text-left text-base font-semibold"
                        key={tableHeaderData.id}
                      >
                        {tableHeaderData.column}
                      </th>
                    )
                  )}
                  <th className="px-6 py-3 text-right text-base font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((productData: ProductData) => (
                  <tr key={productData.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-textdark4">
                      {productData.image_url &&
                      productData.image_url.length > 0 &&
                      productData.image_url[0] ? (
                        <div className="group relative inline-block">
                          <Image
                            src={productData.image_url[0]}
                            alt={productData.product_name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded transition-transform duration-200 group-hover:scale-110 shadow-md border border-gray-200"
                          />
                        </div>
                      ) : (
                        <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-gray-200 text-gray-400 text-xl relative group cursor-default border border-gray-200">
                          <FaRegImage />
                          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            No Image Available
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-textdark4">
                      {productData.product_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-textdark4">
                      {productData.brand_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-textdark4">
                      {productData.price}
                    </td>
                    <td className="px-6 py-4 text-sm text-textdark4">
                      {productData.stock}
                    </td>
                    <td className="px-6 py-4 text-sm text-textdark4">
                      <span
                        className={`inline-block px-3 py-1 rounded-xl border font-semibold text-xs ${getStatusBadge(
                          productData.status
                        )}`}
                      >
                        {productData.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-textdark4">
                      {new Date(productData.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                      <br />
                      {
                        new Date(productData.created_at)
                          .toISOString()
                          .split("T")[0]
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-textdark4 text-right">
                      <button className="text-primary font-medium transition mr-4">
                        <PiPencilSimpleLineDuotone size={22} />
                      </button>
                      <button className="text-red-600 hover:text-red-800 font-medium transition">
                        <PiTrashDuotone size={22} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      {/* Pagination */}
      <PaginationComponent
        data={data}
        onPageChange={onPageChange}
        currentPage={currentPage}
        totalResult={data?.pagination.totalProducts}
      />
      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
      />
    </div>
  );
}
