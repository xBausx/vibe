"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess: () => {
      toast.success("Background job started!");
    }
  }));


  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Button disabled={invoke.isPending} onClick={() => invoke.mutate({ text: "Rico"})}>
        Invoke Background Job
      </Button>
    </div>
  );
}

export default Page;