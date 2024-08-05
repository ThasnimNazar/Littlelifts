import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Hero from './Hero';
import Feature from './Feature';
import Footer from './Footer';
import { RootState } from './Store';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import { FiTrendingUp } from 'react-icons/fi';

const Landscreen = () => {

const { parentInfo } = useSelector((state:RootState)=>state.parentAuth)
const { sitterInfo } = useSelector((state:RootState)=>state.sitterAuth)
const navigate = useNavigate();


useEffect(()=>{
  if(parentInfo){
    navigate('/')
  }
  else if(sitterInfo?.verified === true){
    navigate('/sitter/sitterhome')
  }
},[])
    return (
        <>
            <Header />
            <Hero />
            <Feature />
            <Footer />
        </>
    );
};

export default Landscreen;
