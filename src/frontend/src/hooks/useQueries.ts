import { useMutation } from "@tanstack/react-query";
import type { OrderItem } from "../backend.d.ts";
import { useActor } from "./useActor";

export interface SubmitOrderParams {
  customerName: string;
  deliveryPlace: string;
  mobileNumber: string;
  items: OrderItem[];
  totalAmount: bigint;
}

export function useSubmitOrder() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: SubmitOrderParams): Promise<bigint> => {
      if (!actor) throw new Error("Not connected");
      return actor.submitOrder(
        params.customerName,
        params.deliveryPlace,
        params.mobileNumber,
        params.items,
        params.totalAmount,
      );
    },
  });
}
