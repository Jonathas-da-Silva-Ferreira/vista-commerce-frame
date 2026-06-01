import { useRef, useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImagePreview } from '@/components/ImagePreview';
import { toast } from 'sonner';

// Centralizing the upload constraints here keeps validation and the user
// hint text in lockstep — drift between the two is a common bug when limits
// live as magic numbers scattered across the codebase.
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB cap to protect bandwidth/storage costs
const ACCEPTED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_EXT_HINT = 'JPG, JPEG, PNG, WEBP up to 5 MB';

interface ProductImageUploaderProps {
  /** Current uploaded image as a data URL (or future remote URL once storage is wired up). */
  value: string;
  /** Called with the resulting URL/data URL, or empty string when cleared. */
  onChange: (value: string) => void;
}

/**
 * ProductImageUploader
 *
 * Encapsulates the "upload from computer" flow. Today it converts the file
 * into a base64 data URL so the rest of the app (listings, cart, favorites)
 * can render it through a standard <img src>. The component is intentionally
 * shaped around an async `uploadFile` step so we can swap the implementation
 * for a real object storage backend (S3 / Cloudinary / Supabase Storage)
 * without touching any callers — only the body of `uploadFile` changes.
 */
export function ProductImageUploader({ value, onChange }: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Loading state powers the spinner and disables the button so the user
  // cannot trigger overlapping uploads while the FileReader is working.
  const [isUploading, setIsUploading] = useState(false);

  // Abstracted "upload" step. Right now it uses FileReader to produce a
  // data URL because the project has no storage bucket provisioned yet.
  // Swap this with a fetch() to a signed-URL endpoint when cloud storage
  // is enabled — the rest of the component stays untouched.
  const uploadFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    // Mime check first — cheaper than reading bytes and gives a precise
    // error message when the user picks the wrong file type.
    if (!ACCEPTED_MIME.includes(file.type)) {
      toast.error('Unsupported format. Use JPG, PNG or WEBP.');
      return;
    }
    // Size check protects the backend and the user's bandwidth. Doing it
    // client-side avoids a wasted round-trip for obviously oversized files.
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Image is larger than 5 MB.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch {
      // Generic message — the underlying error rarely helps end users and
      // can leak internal details. Logging would happen in a real backend.
      toast.error('Could not upload the image. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Clearing also resets the hidden input so the user can re-pick the same
  // file (browsers ignore a "change" event when the value is unchanged).
  const clear = () => {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME.join(',')}
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="gap-2"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isUploading ? 'Uploading...' : value ? 'Replace image' : 'Choose image'}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={clear} className="gap-1 text-muted-foreground">
            <X className="w-3 h-3" /> Remove
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">Accepted: {ACCEPTED_EXT_HINT}.</p>

      {value && <ImagePreview src={value} className="w-32 h-32" />}
    </div>
  );
}

export default ProductImageUploader;
