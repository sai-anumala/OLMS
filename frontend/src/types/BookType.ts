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
}