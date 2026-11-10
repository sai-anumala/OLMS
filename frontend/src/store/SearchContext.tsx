import { createContext, useContext, useState } from "react"
 
type SearchTermContextType={
    searchTerm:string;
    setSearchTerm:(term:string)=>void
}
 
const SearchTermContext = createContext<SearchTermContextType|undefined>(undefined)
 
export function SearchTermProvider({children}: { children: React.ReactNode }){
    const [searchTerm,setSearchTerm] = useState("")
    return(<SearchTermContext.Provider value={{searchTerm,setSearchTerm}}>{children}</SearchTermContext.Provider>)
}
 
export function useSearchTermContext(){
    const context= useContext(SearchTermContext)
        if (!context) throw new Error("useSearchTermContext must be used within SearchTermProvider");
    return context
}