import { useQuery } from "@tanstack/react-query";
import { InventoryTable } from "@/components/inventory-table";
import type { Product } from "@shared/schema";
import { useEffect, useRef, useState } from "react";

export default function InventoryPage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(600);

  const searchParams = new URLSearchParams(window.location.search);
  const initialSearch = searchParams.get("search") || "";

  useEffect(() => {
    function updateHeight() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setTableHeight(Math.max(400, window.innerHeight - rect.top - 24));
      }
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <div className="p-3 md:p-4 max-w-[1400px] mx-auto" ref={containerRef}>
      <div className="mb-3">
        <h1 className="text-lg font-semibold tracking-tight">Inventory</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Virtualized table rendering {(products || []).length.toLocaleString()} products at 60fps
        </p>
      </div>
      <InventoryTable
        products={products || []}
        isLoading={isLoading}
        containerHeight={tableHeight - 160}
        initialSearch={initialSearch}
      />
    </div>
  );
}
