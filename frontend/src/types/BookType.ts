export type BookType={
    _id?:string,
    title:string,
    author:string,
    image:string,
    rating:number;
    availability:number;
    description:string;
    isbn:string;
    pages:number;
    genre:string;
    copies?:number;
    published:string;
    status?:boolean
    isDelete?:boolean;
    isAvailable?:boolean; // decided by the server: copies left, active and not removed
}

// short book details the server attaches to borrowed / returned records
export type BookSummaryType={
    _id:string;
    title:string;
    author:string;
    image:string;
}