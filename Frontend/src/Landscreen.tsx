import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Header from "./Header"
import Hero from "./Hero"
import Sittingcards from "./Sittingcards"
import Feature from "./Feature"
import Footer from "./Footer"
import { RootState } from './Store'
import Productslider from './Productslider'

const Landscreen = () =>{

    const { parentInfo } = useSelector((state:RootState)=>state.parentAuth)
    const { sitterInfo } = useSelector((state:RootState)=>state.sitterAuth)

    const navigate = useNavigate()

    useEffect(()=>{
         if(parentInfo){
           navigate('/')
         }
         else if(sitterInfo){
            navigate('/sitter/sitterhome')
         }
    })
    return(
        <>
        <Header/>
        <Hero/>
        <Feature/>
        <Footer/>
        </>
    )
}

export default Landscreen