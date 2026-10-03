import RelaxingLoader from "@/components/RelaxingLoader";

export default function RootLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <RelaxingLoader label="Loading atelier..." size={150} />
    </div>
  );
}
