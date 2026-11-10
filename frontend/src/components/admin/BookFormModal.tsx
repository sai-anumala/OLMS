import { useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { BookType } from "../../types/BookType";
import { useBooks } from "../../store/BooksContext";
import { FormInput, FormSelect, FormTextarea } from "../common/FormField";
import { useCloudinaryUpload } from "../../hooks/useCloudinaryUpload";

const GENRES = [
  "Mystery/Crime", "Thriller/Suspense", "Fantasy", "Science Fiction (Sci-Fi)", "Romance", "Horror",
  "Historical Fiction", "Adventure", "Biography/Memoir", "History", "Science/Technical",
  "Cookbooks/Food Writing", "Travel Writing",
];

const EMPTY_BOOK: BookType = {
  title: "", author: "", image: "", rating: 1, availability: 1, description: "",
  isbn: "", pages: 1, genre: "", copies: 1, published: "",
};

type BookFormModalProps = {
  show: boolean;
  onHide: () => void;
  book?: BookType; // edit when given, add otherwise
};

// Add / edit book form (one form for both, so the rules can't drift apart)
function BookFormModal({ show, onHide, book }: BookFormModalProps) {
  const isEdit = Boolean(book);
  const { addNewBook, updateBook } = useBooks();
  const { imageUrl, uploading, error: uploadError, handleImageUpload, clearImage } = useCloudinaryUpload();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<BookType>({ defaultValues: book ?? EMPTY_BOOK });

  // load the chosen book (or a blank form) each time the modal opens
  useEffect(() => {
    if (show) reset(book ?? EMPTY_BOOK);
    else clearImage();
  }, [show, book, reset, clearImage]);

  useEffect(() => {
    if (imageUrl) setValue("image", imageUrl, { shouldValidate: true });
  }, [imageUrl, setValue]);

  const image = watch("image");
  const genre = watch("genre");
  const genreOptions = [...new Set([...GENRES, ...(genre ? [genre] : [])])].map((g) => ({ value: g, label: g }));

  const onSubmit = async (data: BookType) => {
    if (!data.image) {
      toast.error("Please upload a cover image first");
      return;
    }
    const saved = isEdit ? await updateBook(data) : await addNewBook(data).catch(() => false);
    if (saved) onHide();
  };

  const numberRule = (label: string, min: number, max?: number) => ({
    valueAsNumber: true,
    required: `${label} is required`,
    min: { value: min, message: `${label} must be at least ${min}` },
    ...(max !== undefined && { max: { value: max, message: `${label} must be at most ${max}` } }),
  });

  return (
    <Modal show={show} onHide={onHide} size="lg" fullscreen="sm-down" aria-labelledby="book-form-title">
      <Modal.Header closeButton>
        <Modal.Title id="book-form-title" as="h4" className="text-break">
          {isEdit ? `Edit Book: ${book?.title}` : "Add New Book"}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Modal.Body>
          <div className="row g-3 text-start">
            <div className="col-md-6">
              <FormInput label="Book Title" placeholder="Book title" error={errors.title?.message}
                {...register("title", { required: "Title is required" })} />
            </div>
            <div className="col-md-6">
              <FormInput label="Author" placeholder="Author" error={errors.author?.message}
                {...register("author", { required: "Author is required" })} />
            </div>
            <div className="col-md-6">
              <FormInput label="ISBN" placeholder="ISBN" error={errors.isbn?.message}
                {...register("isbn", {
                  required: "ISBN is required",
                  pattern: { value: /^97[89]-?\d{10}$/, message: "ISBN must be 13 digits starting with 978 or 979" },
                })} />
            </div>
            <div className="col-md-6">
              <FormSelect label="Genre" options={genreOptions} error={errors.genre?.message}
                {...register("genre", { required: "Genre is required" })} />
            </div>
            <div className="col-12">
              <FormTextarea label="Description" placeholder="Description" rows={3} error={errors.description?.message}
                {...register("description", { required: "Description is required" })} />
            </div>
            <div className="col-6 col-md-3">
              <FormInput label="Total Copies" type="number" min="1" error={errors.copies?.message} {...register("copies", numberRule("Copies", 1))} />
            </div>
            <div className="col-6 col-md-3">
              <FormInput label="Available" type="number" min="0" error={errors.availability?.message} {...register("availability", numberRule("Availability", 0))} />
            </div>
            <div className="col-6 col-md-3">
              <FormInput label="Rating" type="number" min="1" max="5" step="0.1" error={errors.rating?.message} {...register("rating", numberRule("Rating", 1, 5))} />
            </div>
            <div className="col-6 col-md-3">
              <FormInput label="Pages" type="number" min="1" error={errors.pages?.message} {...register("pages", numberRule("Pages", 1))} />
            </div>
            <div className="col-md-6">
              <FormInput label="Published Date" type="date" error={errors.published?.message}
                {...register("published", { required: "Published date is required" })} />
            </div>
            <div className="col-md-6">
              <label htmlFor="book-image-upload" className="form-label">
                Cover Image {!isEdit && <span className="text-danger">*</span>}
              </label>
              <input id="book-image-upload" type="file" accept="image/*" className="form-control"
                onChange={handleImageUpload} disabled={uploading} aria-invalid={!!uploadError} />
              <div className="form-text">JPEG, PNG, GIF or WebP, max 5MB{isEdit && " — leave empty to keep the current cover"}</div>
              {uploadError && <div className="text-danger small" role="alert">{uploadError}</div>}
            </div>
            {(uploading || image) && (
              <div className="col-12 d-flex align-items-center gap-2">
                {uploading && <div className="spinner-border spinner-border-sm text-primary" role="status"><span className="visually-hidden">Uploading...</span></div>}
                {image && !uploading && <img src={image} alt="Book cover preview" className="img-thumbnail" style={{ maxWidth: "120px", maxHeight: "160px" }} />}
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={onHide} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn btn-dark px-4" disabled={isSubmitting || uploading || !image}>
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Add Book"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default BookFormModal;
