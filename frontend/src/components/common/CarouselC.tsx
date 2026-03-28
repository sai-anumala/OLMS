import {  Carousel } from "react-bootstrap";
import { fetchBooks } from "../../store/BooksContext";

function CarouselC() {
  const { books } = fetchBooks();
  return (
    <div>
      <Carousel fade style={{width:"100%" }}>
        {books.map((book) => (
          <Carousel.Item interval={1000} key={book._id}>
            <div
              className="row align-items-center  "
              // style={{ background: "linear-gradient(to right, #1b78dbff, #15dac3ff)" }}
              style={{backgroundImage:`url(${book.image})`,backgroundSize:"cover",backgroundPosition:"center",height:"400px",padding:"2rem",}}
            >
              <div className="col-md-6 text-start">
                <img
                  src={book.image}
                  alt=""
                  className="img-fluid"
                  style={{ height: "350px", width: "300px" }}
                />
              </div>
              <div className="col-md-6 text-start text-white bg-dark bg-opacity-75 p-4 rounded " style={{maxWidth:"600px",width:"100%"}}>
                <h3>{book.title}</h3>
               <p>{book.description}</p>
                {/* <button className="btn btn-warning">View </button> */}
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default CarouselC;
