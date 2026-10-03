import RelaxingLoader from "@/components/RelaxingLoader";

export default function DashboardLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <RelaxingLoader label="Opening Orders & Purchases..." size={150} />
    </div>
  );
}
