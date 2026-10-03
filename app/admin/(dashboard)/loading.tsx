import RelaxingLoader from "@/components/RelaxingLoader";

export default function AdminLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <RelaxingLoader label="Opening Admin Studio CMS..." size={150} />
    </div>
  );
}
