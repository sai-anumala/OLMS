import { createContext, useContext, useState } from "react"
 
type SearchTermContextType={
    searchTerm:string;
    setSearchTerm:(term:string)=>void
}
 
let SearchTermContext = createContext<SearchTermContextType|undefined>(undefined)
 
export function SearchTermProvider({children}: { children: React.ReactNode }){
    let [searchTerm,setSearchTerm] = useState("")
    return(<SearchTermContext.Provider value={{searchTerm,setSearchTerm}}>{children}</SearchTermContext.Provider>)
}
 
export function useSearchTermContext(){
    let context= useContext(SearchTermContext)
        if (!context) throw new Error("useSearchTermContext must be used within SearchTermProvider");
    return context
}