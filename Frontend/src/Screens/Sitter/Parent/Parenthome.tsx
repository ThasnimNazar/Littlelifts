import Parentheader from "../../../Layouts/Adminlayouts/Parent/Parentheader"
import Parenthero from "../../../Components/Parent/parentHero"
import Sittingcards from "../../../Sittingcards"
import Feature from "../../../Feature"
import Footer from "../../../Footer"

const Parenthome : React.FC = () =>{
    return(
        <>
        <Parentheader/>
        <Parenthero/>
        <Sittingcards/>
        <Feature/>
        {/*rating*/}
        <Footer/>
        </>
    )
}

export default Parenthome