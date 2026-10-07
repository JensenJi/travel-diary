import Navbar from "@/components/Navbar";

export default function Insurance() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <iframe
        src="/pension-calculator.html"
        title="保险计算"
        className="w-full border-0"
        style={{ marginTop: "40px", height: "calc(100vh - 40px)" }}
      />
    </div>
  );
}
