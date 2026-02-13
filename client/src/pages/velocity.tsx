import { useQuery } from "@tanstack/react-query";
import { VelocityPredictor } from "@/components/velocity-predictor";
import type { Product } from "@shared/schema";

export default function VelocityPage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Sales Velocity Predictor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Predict stock-out risks based on current sales velocity and inventory levels
        </p>
      </div>
      <VelocityPredictor products={products || []} isLoading={isLoading} />
    </div>
  );
}
