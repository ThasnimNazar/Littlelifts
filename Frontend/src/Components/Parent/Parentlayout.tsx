import Parentsidemenu from "./Parentsidemenu"
import Header from "../../Header"

const Parentlayout : React.FC<{children:React.ReactNode}> = ({children}) =>{
    return(
        <>
        <Header />
        <div className="flex h-screen bg-white">
          <div className="hidden md:flex flex-col w-64 bg-white text-black">
            <Parentsidemenu />
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="p-4">
              {children}
            </div>
          </div>
        </div>
      </>
    )
}

export default Parentlayout