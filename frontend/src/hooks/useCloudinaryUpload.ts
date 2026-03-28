import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface UseCloudinaryUploadReturn {
  imageUrl: string;
  uploading: boolean;
  error: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearImage: () => void;
}

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        toast.error("Image size must be less than 5MB");
        return;
      }

      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) {
          throw new Error(`Upload failed: ${res.statusText}`);
        }

        const data = await res.json();
        setImageUrl(data.secure_url);
        toast.success("Image uploaded successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Image upload failed";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const clearImage = useCallback(() => {
    setImageUrl("");
    setError(null);
  }, []);

  return {
    imageUrl,
    uploading,
    error,
    handleImageUpload,
    clearImage,
  };
}
