// "use client";

// import { useTRPC } from "@/trpc/client";
// import { useQuery } from "@tanstack/react-query";
// import { caller } from '@/trpc/server';

import { getQueryClient, trpc } from "@/trpc/server";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Suspense } from "react";

import { Client } from "./client";

//const Page = () => {
const Page = async () => {
  // const trpc = useTRPC();
  // const { data } = useQuery(trpc.createAI.queryOptions({ text: "John" }));
  // old : const { data } = useQuery(fetch("/api/create-ai", { body: JSON}))
  //const data = await caller.createAI({ text : "Rico Server"});
  // localhost:300/api/create-ai?body={text:"hello"}
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.createAI.queryOptions({ text : "Rico PREFETCH"}))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* {JSON.stringify(data)} */}
      <Suspense>
        <Client />
      </Suspense>
      
    </div>
    </HydrationBoundary>
  );
}

export default Page;