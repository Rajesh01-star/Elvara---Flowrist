"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  Package, 
  ShoppingBag, 
  Eye, 
  Calendar, 
  Plus, 
  UploadCloud, 
  X, 
  Loader2, 
  Edit3, 
  Check, 
  ExternalLink
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { formatPrice, formatDate, formatViews, getActiveThumbnail } from "@/lib/utils";
import { 
  getShopStatsAction, 
  getProductsAction, 
  getUploadUrlAction, 
  createProductAction, 
  updateProductAction 
} from "./actions";
import AuthDialog from "@/components/AuthDialog";
import { toast } from "sonner";

export default function AdminPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const queryClient = useQueryClient();
  const [authOpen, setAuthOpen] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [assetType, setAssetType] = useState("bouquets");
  const [aspect, setAspect] = useState<"horizontal" | "vertical">("horizontal");
  const [tagsInput, setTagsInput] = useState("");
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch metrics stats
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      return await getShopStatsAction();
    },
    enabled: !!session?.user?.isAdmin,
  });

  // Fetch admin products list
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      return await getProductsAction();
    },
    enabled: !!session?.user?.isAdmin,
  });

  // Upload image to Cloudflare R2 via presigned PUT url
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // 1. Request presigned URL from server action
      const { uploadUrl, fileKey } = await getUploadUrlAction(
        file.name,
        file.type || "image/jpeg",
        true
      );

      // 2. Upload file directly to R2 bucket
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });

      if (!res.ok) {
        throw new Error("Direct upload to storage failed");
      }

      setThumbnails((prev) => [...prev, fileKey]);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setAssetType("bouquets");
    setAspect("horizontal");
    setTagsInput("");
    setThumbnails([]);
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setTitle(p.title || "");
    setDescription(p.description || "");
    setPrice(p.price || "");
    setAssetType(p.assetType || "bouquets");
    setAspect(p.aspect || "horizontal");
    setTagsInput(Array.isArray(p.tags) ? p.tags.join(", ") : "");
    setThumbnails(p.thumbnails || []);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (editingProduct?.id) {
        formData.append("id", editingProduct.id);
      }
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("price", price.trim());
      formData.append("assetType", assetType);
      formData.append("aspect", aspect);
      formData.append("activeThumbnailIndex", "0");

      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(tagsArray));
      formData.append("thumbnails", JSON.stringify(thumbnails));
      formData.append("references", JSON.stringify([]));

      if (editingProduct?.id) {
        await updateProductAction(formData);
        toast.success("Product updated successfully!");
      } else {
        await createProductAction(formData);
        toast.success("New product published to catalog!");
      }

      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error(err?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen py-32 flex flex-col items-center justify-center text-neutral-500">
        <Loader2 className="size-8 animate-spin text-stone-600 mb-3" />
        <p className="text-sm">Verifying atelier credentials...</p>
      </div>
    );
  }

  // Unauthorized state
  if (!session?.user || !session.user.isAdmin) {
    return (
      <main className="min-h-screen py-24 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center rounded-3xl bg-white p-8 sm:p-10 border border-stone-200 shadow-xl">
          <div className="size-16 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={32} />
          </div>
          <h1 className="font-serif text-3xl text-neutral-900">Restricted Access</h1>
          <p className="mt-2 text-sm text-neutral-600 font-light leading-relaxed">
            The Studio CMS is reserved for authenticated florists and atelier administrators.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => setAuthOpen(true)}
              className="w-full rounded-full bg-neutral-900 py-3 text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Sign In With Admin Account
            </button>
            <Link
              href="/"
              className="w-full rounded-full border border-stone-200 py-2.5 text-xs font-medium text-neutral-700 hover:bg-stone-50 transition-colors"
            >
              Return to Boutique Homepage
            </Link>
          </div>
          <AuthDialog isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-stone-200/80 gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs uppercase tracking-wider font-semibold mb-2">
              <ShieldCheck size={13} className="text-amber-700" />
              <span>Atelier Management Portal</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900">
              Studio Catalog CMS
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Curate floral designs, update offerings, and inspect shop analytics
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-xs font-medium text-white hover:bg-neutral-800 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Create New Offering</span>
          </button>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between text-stone-400 mb-3">
              <span className="text-xs uppercase font-medium tracking-wider">Total Items</span>
              <Package size={18} />
            </div>
            <span className="font-serif text-3xl font-medium text-neutral-900">
              {stats?.totalCount ?? 0}
            </span>
            <p className="text-[11px] text-neutral-500 mt-1">Active floral products</p>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-3">
              <span className="text-xs uppercase font-medium tracking-wider text-stone-400">
                Paid Orders
              </span>
              <ShoppingBag size={18} />
            </div>
            <span className="font-serif text-3xl font-medium text-neutral-900">
              {stats?.paidOrders ?? 0}
            </span>
            <p className="text-[11px] text-neutral-500 mt-1">Completed purchases</p>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between text-amber-600 mb-3">
              <span className="text-xs uppercase font-medium tracking-wider text-stone-400">
                New (30 Days)
              </span>
              <Calendar size={18} />
            </div>
            <span className="font-serif text-3xl font-medium text-neutral-900">
              {stats?.newMonthlyItems ?? 0}
            </span>
            <p className="text-[11px] text-neutral-500 mt-1">Recently created stems</p>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between text-blue-600 mb-3">
              <span className="text-xs uppercase font-medium tracking-wider text-stone-400">
                Total Views
              </span>
              <Eye size={18} />
            </div>
            <span className="font-serif text-3xl font-medium text-neutral-900">
              {formatViews(stats?.totalViews ?? 0)}
            </span>
            <p className="text-[11px] text-neutral-500 mt-1">Client engagement views</p>
          </div>
        </div>

        {/* Product Management Table */}
        <div className="rounded-3xl bg-white border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-serif text-xl text-neutral-900">All Catalog Offerings</h3>
            <span className="text-xs text-neutral-500 font-medium">
              {products.length} products listed
            </span>
          </div>

          {productsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-400">
              <Loader2 className="size-7 animate-spin text-stone-600 mb-2" />
              <p className="text-xs">Loading offerings catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-neutral-500">
              <p className="font-serif text-lg">No products found</p>
              <p className="text-xs mt-1">Click &ldquo;Create New Offering&rdquo; above to publish your first bouquet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-stone-100">
                  <tr>
                    <th className="py-3.5 px-6">Product</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-4">Published</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((item: any) => {
                    const thumb = getActiveThumbnail(item);
                    return (
                      <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="relative size-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                            <Image
                              src={thumb}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/products/${item.id}`}
                              className="font-medium text-neutral-900 hover:underline line-clamp-1 text-sm"
                            >
                              {item.title}
                            </Link>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {item.id}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 uppercase text-[10px] font-semibold tracking-wider text-stone-600">
                          {item.assetType}
                        </td>
                        <td className="py-4 px-4 font-serif text-sm font-medium text-neutral-900">
                          {formatPrice(item.price)}
                        </td>
                        <td className="py-4 px-4 text-stone-600">
                          {item.views ?? 0}
                        </td>
                        <td className="py-4 px-4 text-stone-500">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => openEditModal(item)}
                            className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 text-[11px] font-medium text-neutral-700 hover:bg-stone-100 transition-colors"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-100 z-10">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 rounded-full p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="font-serif text-2xl text-neutral-900 mb-1">
              {editingProduct ? "Edit Floral Offering" : "New Studio Offering"}
            </h2>
            <p className="text-xs text-neutral-500 mb-6">
              Published creations appear immediately on the storefront with instant checkout.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Design Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autumn Blossom Peony Symphony"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="85.00"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                  >
                    <option value="bouquets">Bouquets</option>
                    <option value="collections">Vessel Collections</option>
                    <option value="workshops">Workshops</option>
                    <option value="gifts">Botanical Gifts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Orientation
                  </label>
                  <select
                    value={aspect}
                    onChange={(e) => setAspect(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                  >
                    <option value="horizontal">Horizontal (4:3)</option>
                    <option value="vertical">Vertical (3:4)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Description & Story
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Botanical varieties, scent notes, vessel artisan, or masterclass details..."
                  className="w-full rounded-xl border border-stone-200 p-3 text-xs sm:text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="peonies, luxury, wedding, signature"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              {/* R2 Image Uploader */}
              <div className="rounded-2xl border border-stone-200/90 bg-stone-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-800 flex items-center gap-1.5">
                    <UploadCloud size={15} className="text-stone-600" />
                    <span>Upload Images to Cloudflare R2</span>
                  </label>
                  <span className="text-[10px] text-stone-400">Direct S3 presigned PUT</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-white border border-stone-300 px-4 py-2 text-xs font-medium text-neutral-800 hover:bg-stone-50 transition-colors shadow-2xs">
                    {uploadingImage ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Plus size={13} />
                    )}
                    <span>{uploadingImage ? "Uploading..." : "Select File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    {thumbnails.length} {thumbnails.length === 1 ? "image" : "images"} attached
                  </span>
                </div>

                {/* Thumbnails preview pills */}
                {thumbnails.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {thumbnails.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 rounded-full bg-white border border-stone-200 pl-2.5 pr-1.5 py-1 text-[11px] text-neutral-700 shadow-2xs"
                      >
                        <span className="max-w-[120px] truncate">{t.split("/").pop()}</span>
                        <button
                          type="button"
                          onClick={() => setThumbnails(thumbnails.filter((_, i) => i !== idx))}
                          className="size-4 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-stone-200 px-5 py-2.5 text-xs font-medium text-neutral-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-sm"
                >
                  {submitting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} />
                  )}
                  <span>{editingProduct ? "Save Changes" : "Publish to Store"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
