import { Modal, ModalBody, ModalHeader } from 'react-bootstrap';
import {useForm} from 'react-hook-form'
import { fetchBooks } from '../../store/BooksContext';
import type { BookType } from '../../types/BookType';
import { useEffect } from 'react';

type PropsType={
    showEditModal:boolean,
    onHideEditModal:()=>void;
    bookId:string;
}

function BookEdit({ showEditModal, onHideEditModal,bookId }:PropsType) { 

    // To get the update function
    const {books,updateBook}=fetchBooks()

    // Find the book data based on the bookId prop
    const bookData=books.find(bookObj=>bookObj._id===bookId)

    // react hook form intialise
    const {register,formState:{errors},handleSubmit,reset}=useForm<BookType>({defaultValues:bookData})

    // handle submit for update book data
    const onSubmit=async(updatedBookData:BookType)=>{
        updateBook(updatedBookData) // passing modified book data to update function 
        onHideEditModal() // after submitting hide modal
    }
    
    // because using useform (the useform intializes once only so in the first render the default vallues will be undefined so for the purppse of it using useeffct)
    useEffect(()=>{
       if(bookData){ reset(bookData)}
    },[bookData,reset])
    return (
        // <div>    
        //     {bookData && (
        //         <Modal show={showEditModal} onHide={onHideEditModal}> 
        //             <ModalHeader closeButton>
        //          <h4>Edit Book: {bookData.title}</h4> 
        //             </ModalHeader>
        //             <ModalBody>
        //                 <div>
        //                     <form onSubmit={handleSubmit(onSubmit)}>
        //                         <div className="row">
        //                             {/* Book Title */}
        //                             <div className="col-md-6 mb-3">
        //                                 <div className="form-floating">
        //                                     <input type="text" {...register("title",{required: true,})} className=" form-control" id="bookTitle" placeholder='Enter book title...'/>
        //                                     <label htmlFor="bookTitle">Enter book title</label>
        //                                 </div>
        //                             </div>
        //                             {/* Book Author */}
        //                             <div className="col-md-6 mb-3">
        //                                 <div className="form-floating">
                                             
        //                                     <input type="text" {...register("author",{required: true,})} className="form-control" id="bookAuthor" placeholder='Enter book author...'/>
        //                                     <label htmlFor="bookAuthor">Enter book author</label>
        //                                 </div>
        //                             </div>
        //                         </div>

        //                         <div className="row">
        //                             {/* Book Description */}
        //                             <div className="col-12 mb-3">
        //                                 <div className="form-floating">
        //                                     <textarea className="form-control" {...register("description",{required: true,})} placeholder='Enter book description...'/>
        //                                     <label>Enter book description</label>
        //                                 </div>
        //                             </div>
        //                         </div>

        //                         <div className="row">
        //                             {/* Book ISBN */}
        //                             <div className="col-md-6 mb-3">
        //                                 <div className="form-floating">
        //                                     <input type="text" {...register("isbn",{required: true,})} className="form-control" id="bookISBN" placeholder='Enter book ISBN...'/>
        //                                     <label htmlFor="bookISBN">Enter book ISBN</label>
        //                                 </div>
        //                             </div>
        //                             {/* Book AVailability */}
        //                             <div className="col-md-6 mb-3">
        //                                 <div className="form-floating">
        //                                     <input type="number" {...register("availability",{valueAsNumber:true, required:true,})} className="form-control" id="bookAvailability" placeholder='Enter book availability...'/>
        //                                     <label htmlFor="bookAvailability">Enter book availability</label>
        //                                 </div>
        //                             </div>
        //                         </div>

        //                         <div className="row">
        //                             {/* Book Copies */}
        //                             <div className="col-md-6 mb-3">
        //                                 <div className="form-floating">
        //                                     <input type="number" {...register("copies",{valueAsNumber:true})} className="form-control" id="bookCopies" placeholder='Enter book copies...' />
        //                                     <label htmlFor="bookCopies">Enter book copies</label>
        //                                 </div>
        //                             </div>

        //                             <div className="col-md-6 mb-3">
        //                                 {/* book genre */}
        //                                 <div className="form-floating">
        //                                     <select id="bookGenre" {...register("genre",{required: true,})} name="genre" className="form-select" >
        //                                         <option value="" disabled ></option>
        //                                         <optgroup label="Fiction (Imagined Stories)">
        //                                             <option value="Mystery/Crime" >Mystery/Crime</option>
        //                                             <option value="Thriller/Suspense">Thriller/Suspense</option>
        //                                             <option value="Fantasy">Fantasy</option>
        //                                             <option value="Science Fiction (Sci-Fi)">Science Fiction (Sci-Fi)</option>
        //                                             <option value="Romance">Romance</option>
        //                                             <option value="Horror">Horror</option>
        //                                             <option value="Historical Fiction">Historical Fiction</option>
        //                                         </optgroup>
        //                                         <optgroup label="Nonfiction (Factual Content)">
        //                                             <option value="Biography/Memoir">Biography/Memoir</option>
        //                                             <option value="History">History</option>
        //                                             <option value="Science/Technical">Science/Technical</option>
        //                                             <option value="Cookbooks/Food Writing">Cookbooks/Food Writing</option>
        //                                             <option value="Travel Writing">Travel Writing</option>
        //                                         </optgroup>
        //                                     </select>
        //                                     <label htmlFor="bookGenre">Select Book Genre</label>
        //                                 </div>
        //                             </div>
        //                         </div>

        //                         <div className="row">
        //                             <div className="col-md-6 mb-3">
        //                                 <div className="form-floating">
        //                                     <input type="number" {...register("rating",{valueAsNumber: true,required: true,})} className="form-control" id="bookRating" placeholder='Enter rating...'/>
        //                                     <label htmlFor="bookRating">Enter book rating</label>
        //                                 </div>
        //                             </div>
        //                             <div className="col-md-6 mb-3">
        //                                 <div className="form-floating">
        //                                     <input type="text" {...register("image")} className="form-control" id="bookImageLink" placeholder='Enter book image link...'/>
        //                                     <label htmlFor="bookImageLink">Enter book image link</label>
        //                                 </div>
        //                             </div>
        //                         </div>
        //                         <div className="row">
        //                             <div className="col-md-6 mb-3">
        //                                 <div className="form-floating">
        //                                     <input type="number" {...register("pages",{valueAsNumber: true,required: true,})} className="form-control" id="bookPages" placeholder='Enter rating...'/>
        //                                     <label htmlFor="bookPages">Enter book pages count</label>
        //                                 </div>
        //                             </div>
        //                             <div className="col-md-6 mb-3">
        //                                 <div className="form-floating">
        //                                     <input type="date" {...register("published",{required: true,})} className="form-control" id="bookPublished" placeholder='Enter book image link...'/>
        //                                     <label htmlFor="bookPublished">Enter book published date</label>
        //                                 </div>
        //                             </div>
        //                         </div>

        //                         <div>
        //                             <button type="submit" className="btn btn-dark mt-3 w-100">Update Book</button>
        //                         </div>
        //                     </form>
        //                 </div>
        //             </ModalBody>
        //         </Modal>
        //     )}
        // </div>
        <div>
      {bookData && (
        <Modal show={showEditModal} onHide={onHideEditModal}>
          <ModalHeader closeButton>
            <h4>Edit Book: {bookData.title}</h4>
          </ModalHeader>
          <ModalBody>
            <div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  {/* Book Title */}
                  <div className="col-md-6 mb-3">
                    <div className="form-floating">
                      <input
                        type="text"
                        {...register("title", { required: "Title is required" })}
                        className=" form-control"
                        id="bookTitle"
                        placeholder="Enter book title..."
                      />
                      <label htmlFor="bookTitle">Enter book title</label>
                      {errors.title && <small className="text-danger">{errors.title.message}</small>}
                    </div>
                  </div>
                  {/* Book Author */}
                  <div className="col-md-6 mb-3">
                    <div className="form-floating">
                      <input
                        type="text"
                        {...register("author", { required: "Author is required" })}
                        className="form-control"
                        id="bookAuthor"
                        placeholder="Enter book author..."
                      />
                      <label htmlFor="bookAuthor">Enter book author</label>
                        {errors.author && (
                      <small className="text-danger">{errors.author.message}</small>
                    )}
                    </div>
                  </div>
                </div>
 
                <div className="row">
                  {/* Book Description */}
                  <div className="col-12 mb-3">
                    <div className="form-floating">
                      <textarea
                        className="form-control"
                        {...register("description", { required: "Description is required" })}
                        placeholder="Enter book description..."
                      />
                      <label>Enter book description</label>
                      {errors.description && (
                      <small className="text-danger">{errors.description.message}</small>
                    )}
                    </div>
                  </div>
                </div>
 
                <div className="row">
                  {/* Book ISBN */}
                  <div className="col-md-6 mb-3">
                    <div className="form-floating">
                      <input
                        type="text"
                        {...register("isbn", { required: "ISBN is required",
                        pattern:{
                          value: /^(978|979)\d{10}$/,
                          message: 'ISBN must be a 13-digit number starting with 978 or 979'
                        }
                      })}
                        className="form-control"
                        id="bookISBN"
                        placeholder="Enter book ISBN..."
                      />
                      <label htmlFor="bookISBN">Enter book ISBN</label>
                       {errors.isbn && <small className="text-danger">{errors.isbn.message}</small>}
                    </div>
                  </div>
                  {/* Book AVailability */}
                  <div className="col-md-6 mb-3">
                    <div className="form-floating">
                      <input
                        type="number"
                        {...register("availability", {
                        valueAsNumber: true,
                        required: "Availability is required",
                         min: {
                              value: 0,
                              message: "Availability cannot be negative value",
                         },
                      })}
                        className="form-control"
                        id="bookAvailability"
                        placeholder="Enter book availability..."
                      />
                      <label htmlFor="bookAvailability">Enter book availability</label>
                        {errors.availability && (
                      <small className="text-danger">{errors.availability.message}</small>
                    )}
                    </div>
                  </div>
                </div>
 
                <div className="row">
                  {/* Book Copies */}
                  <div className="col-md-6 mb-3">
                    <div className="form-floating">
                      <input
                        type="number"
                        {...register("copies", {
                        valueAsNumber: true,
                        required: "Copies count is required",
                          min: {
                              value: 1,
                             message: "Copies must be at least 1",
                        },
                      })}
                        className="form-control"
                        id="bookCopies"
                        placeholder="Enter book copies..."
                      />
                      <label htmlFor="bookCopies">Enter book copies</label>
                          {errors.copies && (
                      <small className="text-danger">{errors.copies.message}</small>
                    )}
                    </div>
                  </div>
 
                  <div className="col-md-6 mb-3">
                    {/* book genre */}
                    <div className="form-floating">
                      <select
                        id="bookGenre"
                        {...register("genre", { required: "Genre is required" })}
                        name="genre"
                        className="form-select"
                      >
                        <option value="" disabled></option>
                        <optgroup label="Fiction (Imagined Stories)">
                          <option value="Mystery/Crime">Mystery/Crime</option>
                          <option value="Thriller/Suspense">Thriller/Suspense</option>
                          <option value="Fantasy">Fantasy</option>
                          <option value="Science Fiction (Sci-Fi)">Science Fiction (Sci-Fi)</option>
                          <option value="Romance">Romance</option>
                          <option value="Horror">Horror</option>
                          <option value="Historical Fiction">Historical Fiction</option>
                        </optgroup>
                        <optgroup label="Nonfiction (Factual Content)">
                          <option value="Biography/Memoir">Biography/Memoir</option>
                          <option value="History">History</option>
                          <option value="Science/Technical">Science/Technical</option>
                          <option value="Cookbooks/Food Writing">Cookbooks/Food Writing</option>
                          <option value="Travel Writing">Travel Writing</option>
                        </optgroup>
                      </select>
                      <label htmlFor="bookGenre">Select Book Genre</label>
                      {errors.genre && <small className="text-danger">{errors.genre.message}</small>}
                    </div>
                  </div>
                </div>
 
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="form-floating">
                      <input
                        type="number"
                        {...register("rating", {
                        valueAsNumber: true,
                        required: "Rating is required",
                         min: {
                            value: 1,
                            message: "Rating must be at least 1",
                            },
                         max: {
                            value: 5,
                            message: "Rating cannot exceed 5",
                         },
                                    })}
                        className="form-control"
                        id="bookRating"
                        placeholder="Enter rating..."
                      />
                      <label htmlFor="bookRating">Enter book rating</label>
                       {errors.rating && (
                      <small className="text-danger">{errors.rating.message}</small>
                    )}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-floating">
                      <input
                        type="text"
                        {...register("image", { required: "Image Link is required" })}
                        className="form-control"
                        id="bookImageLink"
                        placeholder="Enter book image link..."
                      />
                      <label htmlFor="bookImageLink">Enter book image link</label>
                      {errors.image && <small className="text-danger">{errors.image.message}</small>}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="form-floating">
                      <input
                        type="number"
                        {...register("pages", {
                        valueAsNumber: true,
                        required: "Page count is required",
                           min: {
                            value: 30,
                            message: "Page count must be at least 30",
                        },
                      })}
                        className="form-control"
                        id="bookPages"
                        placeholder="Enter rating..."
                      />
                      <label htmlFor="bookPages">Enter book pages count</label>
                      {errors.pages && <small className="text-danger">{errors.pages.message}</small>}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-floating">
                      <input
                        type="date"
                        {...register("published", { required: "Published date is required" })}
                        className="form-control"
                        id="bookPublished"
                        placeholder="Enter book image link..."
                      />
                      <label htmlFor="bookPublished">Enter book published date</label>
                       {errors.published && (
                      <small className="text-danger">{errors.published.message}</small>
                    )}
                    </div>
                  </div>
                </div>
 
                <div>
                  <button type="submit" className="btn btn-dark mt-3 w-100">
                    Update Book
                  </button>
                </div>
              </form>
            </div>
          </ModalBody>
        </Modal>
      )}
    </div>
    );
}

export default BookEdit;