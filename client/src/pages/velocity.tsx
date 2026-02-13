import { useQuery } from "@tanstack/react-query";
import { VelocityPredictor } from "@/components/velocity-predictor";
import type { Product } from "@shared/schema";

export default function VelocityPage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="p-3 md:p-4 max-w-[1400px] mx-auto">
      <div className="mb-3">
        <h1 className="text-lg font-semibold tracking-tight">Sales Velocity Predictor</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Predict stock-out risks based on current sales velocity and inventory levels
        </p>
      </div>
      <VelocityPredictor products={products || []} isLoading={isLoading} />
    </div>
  );
}
