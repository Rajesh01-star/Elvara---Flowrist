import RelaxingLoader from "@/components/RelaxingLoader";

export default function CollectionsLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <RelaxingLoader label="Curating handcrafted creations..." size={150} />
    </div>
  );
}
