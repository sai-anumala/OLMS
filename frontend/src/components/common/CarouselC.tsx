import { Carousel } from "react-bootstrap";
import { useBooks } from "../../store/BooksContext";

// Featured books slider; on phones only the cover shows, the description appears from md up
function CarouselC() {
  const { books } = useBooks();
  return (
    <Carousel fade>
      {books.map((book) => (
        <Carousel.Item interval={3000} key={book._id}>
          <div className="carousel-slide row g-0 align-items-center" style={{ backgroundImage: `url(${book.image})` }}>
            <div className="col-12 col-md-5 d-flex justify-content-center">
              <img src={book.image} alt={book.title} className="carousel-cover" />
            </div>
            <div className="col-md-7 d-none d-md-block text-start text-white bg-dark bg-opacity-75 p-4 rounded">
              <h3>{book.title}</h3>
              <p className="mb-0 carousel-text">{book.description}</p>
            </div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default CarouselC;
