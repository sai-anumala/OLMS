import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import { useForm } from "react-hook-form";
import type { BookType } from "../../types/BookType";
import { fetchBooks } from "../../store/BooksContext";
import { useEffect } from "react";
import { FormInput, FormSelect, FormTextarea } from "../common/FormField";
import { useCloudinaryUpload } from "../../hooks/useCloudinaryUpload";
import toast from "react-hot-toast";

type PropsType = {
  show: boolean;
  onHide: () => void;
};

const GENRE_OPTIONS = [
  { value: "Fantasy", label: "Fantasy" },
  { value: "Science", label: "Science" },
  { value: "History", label: "History" },
];

function AddBook({ show, onHide }: PropsType) {
  const { addNewBook } = fetchBooks();
  const { imageUrl, uploading, error: uploadError, handleImageUpload, clearImage } =
    useCloudinaryUpload();

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setValue,
  } = useForm<BookType>({
    defaultValues: {
      title: "",
      author: "",
      image: "",
      rating: 1,
      availability: 1,
      description: "",
      isbn: "",
      pages: 1,
      genre: "",
      copies: 1,
      published: "",
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      reset();
      clearImage();
    }
  }, [show, reset, clearImage]);

  // Update image field when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setValue("image", imageUrl, { shouldValidate: true });
    }
  }, [imageUrl, setValue]);

  // Submit Form
  const onSubmit = async (data: BookType) => {
    if (!imageUrl) {
      toast.error("Please upload an image first");
      return;
    }

    try {
      await addNewBook({
        ...data,
        image: imageUrl,
      });

      toast.success("Book added successfully!");
      reset();
      clearImage();
      onHide();
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const handleClearImage = () => {
    clearImage();
    setValue("image", "", { shouldValidate: true });
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        reset();
        clearImage();
        onHide();
      }}
      size="lg"
      aria-labelledby="add-book-modal-title"
    >
      <ModalHeader closeButton>
        <h4 id="add-book-modal-title" className="mb-0">
          Add New Book
        </h4>
      </ModalHeader>

      <ModalBody>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="row g-3">
            {/* TITLE & AUTHOR */}
            <div className="col-md-6">
              <FormInput
                label="Book Title"
                {...register("title", {
                  required: "Title is required",
                })}
                error={errors.title?.message}
                placeholder="Enter book title"
                aria-required="true"
              />
            </div>

            <div className="col-md-6">
              <FormInput
                label="Author"
                {...register("author", {
                  required: "Author is required",
                })}
                error={errors.author?.message}
                placeholder="Enter author name"
                aria-required="true"
              />
            </div>

            {/* ISBN & AVAILABILITY */}
            <div className="col-md-6">
              <FormInput
                label="ISBN"
                type="text"
                {...register("isbn", {
                  required: "ISBN is required",
                  pattern: {
                    value: /^(978|979)\d{10}$/,
                    message: "ISBN must be 13 digits starting with 978 or 979",
                  },
                })}
                error={errors.isbn?.message}
                placeholder="Enter 13-digit ISBN"
                aria-required="true"
              />
            </div>

            <div className="col-md-6">
              <FormInput
                label="Available Copies"
                type="number"
                {...register("availability", {
                  valueAsNumber: true,
                  required: "Availability is required",
                  min: { value: 0, message: "Cannot be negative" },
                })}
                error={errors.availability?.message}
                placeholder="Number of available copies"
                min="0"
                aria-required="true"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="col-12">
              <FormTextarea
                label="Description"
                {...register("description", {
                  required: "Description is required",
                })}
                error={errors.description?.message}
                placeholder="Enter book description"
                rows={3}
                aria-required="true"
              />
            </div>

            {/* COPIES & GENRE */}
            <div className="col-md-6">
              <FormInput
                label="Total Copies"
                type="number"
                {...register("copies", {
                  valueAsNumber: true,
                  required: "Copies is required",
                  min: { value: 1, message: "Must be at least 1" },
                })}
                error={errors.copies?.message}
                placeholder="Total copies in library"
                min="1"
                aria-required="true"
              />
            </div>

            <div className="col-md-6">
              <FormSelect
                label="Genre"
                {...register("genre", { required: "Genre is required" })}
                error={errors.genre?.message}
                options={GENRE_OPTIONS}
                aria-required="true"
              />
            </div>

            {/* RATING & PAGES */}
            <div className="col-md-6">
              <FormInput
                label="Rating"
                type="number"
                {...register("rating", {
                  valueAsNumber: true,
                  required: "Rating is required",
                  min: { value: 1, message: "Minimum rating is 1" },
                  max: { value: 5, message: "Maximum rating is 5" },
                })}
                error={errors.rating?.message}
                placeholder="1-5"
                min="1"
                max="5"
                aria-required="true"
              />
            </div>

            <div className="col-md-6">
              <FormInput
                label="Pages"
                type="number"
                {...register("pages", {
                  valueAsNumber: true,
                  required: "Pages is required",
                  min: { value: 30, message: "Minimum 30 pages" },
                })}
                error={errors.pages?.message}
                placeholder="Number of pages"
                min="30"
                aria-required="true"
              />
            </div>

            {/* PUBLISHED DATE */}
            <div className="col-md-6">
              <FormInput
                label="Published Date"
                type="date"
                {...register("published", {
                  required: "Published date is required",
                })}
                error={errors.published?.message}
                aria-required="true"
              />
            </div>

            {/* IMAGE UPLOAD */}
            <div className="col-12">
              <label htmlFor="book-image-upload" className="form-label">
                Book Cover Image <span className="text-danger">*</span>
              </label>
              <input
                id="book-image-upload"
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleImageUpload}
                disabled={uploading}
                aria-describedby={
                  uploadError ? "image-upload-error" : "image-upload-help"
                }
                aria-invalid={!!uploadError || !!errors.image}
              />

              <div id="image-upload-help" className="form-text">
                Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
              </div>

              {uploadError && (
                <div id="image-upload-error" className="text-danger mt-1" role="alert">
                  {uploadError}
                </div>
              )}

              <div className="mt-2">
                {uploading && (
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                    <span className="visually-hidden">Uploading...</span>
                  </div>
                )}
                {imageUrl && (
                  <div className="position-relative d-inline-block mt-2">
                    <img
                      src={imageUrl}
                      alt="Book cover preview"
                      className="img-thumbnail"
                      style={{ maxWidth: "150px", maxHeight: "200px" }}
                    />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="btn btn-sm btn-danger position-absolute top-0 end-0"
                      aria-label="Remove image"
                      title="Remove image"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                reset();
                clearImage();
                onHide();
              }}
              disabled={isSubmitting || uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={isSubmitting || uploading || !imageUrl}
              aria-busy={isSubmitting || uploading}
            >
              {isSubmitting || uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding...
                </>
              ) : (
                "Add Book"
              )}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}

export default AddBook;