import { prisma } from "@/lib/db";

const Page = async () => {
  const posts = await prisma.post.findMany();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        {JSON.stringify(posts, null, 2)}
    </div>
  );
}

export default Page;