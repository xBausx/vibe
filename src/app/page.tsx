import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Button variant="destructive" size="lg">
        <h1 className="text-4xl font-bold mb-1">Hello World</h1>
      </Button>
    </div>
  );
}

export default Page;