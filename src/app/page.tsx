"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

const Page = () => {
  const [value, setValue] = useState("");

  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess: () => {
      toast.success("Background job started!");
    }
  }));


  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Input value={value} onChange={(e) => setValue(e.target.value)}/>
      <Button disabled={invoke.isPending} onClick={() => invoke.mutate({ value: value})}>
        Invoke Background Job
      </Button>
    </div>
  );
}

export default Page;