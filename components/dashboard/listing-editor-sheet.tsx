"use client";

import { Camera, CheckCircle2, ImagePlus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { propertyTypeLabels, searchLocations, type Property } from "@/lib/properties";

interface ListingDraft {
  title: string;
  township: string;
  purpose: "rent" | "sale";
  propertyType: Property["property_type"];
  price: string;
  bedrooms: string;
  bathrooms: string;
}

interface ListingEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property | null;
  onSave: (draft: ListingDraft) => void;
}

function ListingEditorSheet({ open, onOpenChange, property, onSave }: ListingEditorSheetProps) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [photoCount, setPhotoCount] = useState(0);
  const [draft, setDraft] = useState<ListingDraft>({ title: "", township: "Bahan", purpose: "rent", propertyType: "condo", price: "", bedrooms: "2", bathrooms: "1" });

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setSaved(false);
      setError("");
      setPhotoCount(property?.images.length ?? 0);
      setDraft(property ? { title: property.title, township: property.township, purpose: property.purpose, propertyType: property.property_type, price: String(property.price), bedrooms: String(property.bedrooms), bathrooms: String(property.bathrooms) } : { title: "", township: "Bahan", purpose: "rent", propertyType: "condo", price: "", bedrooms: "2", bathrooms: "1" });
    });
  }, [open, property]);

  const field = (key: keyof ListingDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  function save() {
    if (!draft.title.trim()) {
      setError("Add a clear property title.");
      return;
    }
    if (!draft.price || Number(draft.price) <= 0) {
      setError("Add a valid price in MMK.");
      return;
    }
    setError("");
    onSave(draft);
    setSaved(true);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={property ? "Edit property" : "Create a listing"} description="Add clear facts and strong photos. You can save a draft before publishing." side="right" footer={!saved && <Button className="w-full" onClick={save}>{property ? "Save changes" : "Save listing draft"}</Button>}>
      {saved ? <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center"><span className="grid size-16 place-items-center rounded-full bg-[#EEF5FC] text-[#2D7D46]"><CheckCircle2 className="size-8" /></span><h3 className="mt-5 text-lg font-semibold">{property ? "Property updated" : "Draft created"}</h3><p className="mt-2 max-w-xs text-xs leading-5 text-[#59616A]">Your listing is saved. Complete verification before publishing it to home seekers.</p><Button variant="outline" className="mt-6" onClick={() => onOpenChange(false)}>Back to properties</Button></div> : <div className="space-y-5 p-5 sm:p-7">
        {error && <div role="alert" className="rounded-xl border border-[#EAB7B1] bg-[#FFF7F6] px-4 py-3 text-xs text-[#B13D34]">{error}</div>}
        <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7078]">Property title</span><input value={draft.title} onChange={(event) => field("title", event.target.value)} placeholder="Bright 2-bed condo near Hledan" className="h-11 w-full rounded-xl border border-[#2A2A33]/12 px-3 text-xs outline-none focus:border-[#0057D9]" /></label>
        <div className="grid grid-cols-2 gap-3"><label><span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7078]">Purpose</span><select value={draft.purpose} onChange={(event) => field("purpose", event.target.value)} className="h-11 w-full rounded-xl border border-[#2A2A33]/12 bg-white px-3 text-xs"><option value="rent">For rent</option><option value="sale">For sale</option></select></label><label><span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7078]">Property type</span><select value={draft.propertyType} onChange={(event) => field("propertyType", event.target.value)} className="h-11 w-full rounded-xl border border-[#2A2A33]/12 bg-white px-3 text-xs">{Object.entries(propertyTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
        <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7078]">Township</span><select value={draft.township} onChange={(event) => field("township", event.target.value)} className="h-11 w-full rounded-xl border border-[#2A2A33]/12 bg-white px-3 text-xs">{searchLocations.filter((item) => !["All Myanmar", "Yangon", "Mandalay"].includes(item)).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7078]">Price in MMK</span><input type="number" value={draft.price} onChange={(event) => field("price", event.target.value)} placeholder="800000" className="h-11 w-full rounded-xl border border-[#2A2A33]/12 px-3 text-xs outline-none focus:border-[#0057D9]" /></label>
        <div className="grid grid-cols-2 gap-3"><label><span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7078]">Bedrooms</span><input type="number" min="0" value={draft.bedrooms} onChange={(event) => field("bedrooms", event.target.value)} className="h-11 w-full rounded-xl border border-[#2A2A33]/12 px-3 text-xs" /></label><label><span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7078]">Bathrooms</span><input type="number" min="0" value={draft.bathrooms} onChange={(event) => field("bathrooms", event.target.value)} className="h-11 w-full rounded-xl border border-[#2A2A33]/12 px-3 text-xs" /></label></div>
        <div><span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7078]">Photos</span><label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#0057D9]/30 bg-[#FAF8F5]/60 p-5 text-center"><input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => setPhotoCount(Math.min(event.target.files?.length ?? 0, 20))} /><span className="grid size-10 place-items-center rounded-xl bg-white text-[#0057D9] shadow-sm"><ImagePlus className="size-5" /></span><strong className="mt-3 text-xs">{photoCount ? `${photoCount} photo${photoCount === 1 ? "" : "s"} ready` : "Upload property photos"}</strong><small className="mt-1 text-[9px] text-[#6B7078]">JPG or PNG · up to 20 photos</small></label><p className="mt-2 flex items-center gap-1.5 text-[9px] text-[#6B7078]"><Camera className="size-3.5" />Start with a bright, wide room photo for more inquiries.</p></div>
      </div>}
    </Sheet>
  );
}

export { ListingEditorSheet };
export type { ListingDraft };
