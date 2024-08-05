import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react'
import { Provider  } from 'react-redux'
import App from './App.tsx'
import './index.css'
import store from './Store.tsx';

import Parentregistration from './Screens/Sitter/Parent/Parentregistration.tsx';
import Otpscreen from './Screens/Sitter/Parent/Otpscreen.tsx';
import Parentlogin from './Screens/Sitter/Parent/Parentlogin.tsx';
import Forgetpasswordscreen from './Screens/Sitter/Parent/Forgetpasswordscreen.tsx';
import Forgetotpscreen from './Screens/Sitter/Parent/Forgetotpscreen.tsx';
import Resetpasswordscreen from './Screens/Sitter/Parent/Resetpasswordscreen.tsx';
import Viewparentprofile from './Screens/Sitter/Parent/Viewparentprofile.tsx';
import Babysitters from './Screens/Sitter/Parent/Babysitters.tsx';
import Parentprivateroutes from './Components/Parent/Parrentprivateroutes.tsx';
import Bookingscreen from './Screens/Sitter/Parent/Bookingscreen.tsx';
import Success from './Screens/Sitter/Parent/Success.tsx'
import Parentbookings from './Screens/Sitter/Parent/Parentbookings.tsx';
import Wallet from './Screens/Sitter/Parent/Wallet.tsx';
import Chatscreen from './Screens/Sitter/Parent/Chatscreen.tsx';


import Sitterregisterstep1screen from './Screens/Sitter/Sitterregiterstep1screen.tsx';
import Sitterregisterstep2screen from './Screens/Sitter/Sitterregisterstep2screen.tsx';
import Sitterregisterstep3screen from './Screens/Sitter/Sitterregisterstep3screen.tsx';
import Sitterregisterstep4screen from './Screens/Sitter/Sitterregisterstep4screen.tsx';
import Documentverification from './Screens/Sitter/Documentverification.tsx';
import Sitterdashboard from './Screens/Sitter/Sitterdashboard.tsx';
import Sitterviewprofile from './Screens/Sitter/Sitterviewprofile.tsx';
import Sitterotpscreen from './Screens/Sitter/Sitterotpscreen.tsx';
import Sitterloginscreen from './Screens/Sitter/Sitterloginscreen.tsx';
import Sitterslotscreen from './Screens/Sitter/Sitterslotscreen.tsx';
import Editslotscreen from './Screens/Sitter/Editslotscreen.tsx';
import Sitterforgetpassword from './Screens/Sitter/Sitterforgetpassword.tsx';
import Sitterforgetotp from './Screens/Sitter/Sitterforgetotp.tsx';
import Editslots from './Screens/Sitter/Editslots.tsx';
import Sitterprivateroutes from './Components/Sitter/Sitterprivateroutes.tsx';
import Sitterresetpassword from './Screens/Sitter/Sitterresetpassword.tsx';
import SitterRegistrationStep from './Screens/Sitter/Sitterregisterationstep.tsx';
import Bookings from './Screens/Sitter/Bookings.tsx';
import Sitterchat from './Screens/Sitter/Sitterchat.tsx';



import Adminhomescreen from './Screens/Sitter/Admin/Adminhomescreen.tsx';
import Adminregisterscreen from './Screens/Sitter/Admin/Adminregisterscreen.tsx';
import Adminloginscreen from './Screens/Sitter/Admin/Adminloginscreen.tsx';
import Adminscreen from './Screens/Sitter/Admin/Adminscreen.tsx';
import ManageParent from './Components/Admin/Manageparent.tsx';
import Managesittingcategory from './Components/Admin/Managesittingcategory.tsx';
import Addsitcategory from './Components/Admin/Addsitcategory.tsx';
import Managechildcategory from './Components/Admin/Managechildcategory.tsx';
import Addchildcategory from './Components/Admin/Addchildcategory.tsx';
import Editsittingcategory from './Components/Admin/Editsittingcategory.tsx';
import Managesitter from './Components/Admin/Managesitter.tsx';
import AdminprivateRoutes from './Components/Admin/Adminprivateroutes.tsx';

import { SocketProvider } from './Components/Socket/Socketcontext.tsx';



const rootElement = document.getElementById('root')!;

const root = createRoot(rootElement);
root.render(
  <SocketProvider>
  <ChakraProvider>
  <React.StrictMode>
  <Provider store = {store}>
    <Router>
      <Routes>
        <Route path ='/' element = {  <App />}/>

        <Route path = '/sitter/sitterregister1/' element = {<Sitterregisterstep1screen/>} />
        <Route path = '/sitter/sitterotp' element = {<Sitterotpscreen/>} />
        <Route path = '/sitter/sitterregister2' element = {<Sitterregisterstep2screen/>} />
        <Route path = '/sitter/sitterregisteration' element = {<SitterRegistrationStep/>} />
        <Route path = '/sitter/sitterregister3' element = {<Sitterregisterstep3screen/>} />
        <Route path = '/sitter/sitterregister4/:selectedOptionid' element = {<Sitterregisterstep4screen/>} />
        <Route path = '/sitter/documentverify' element = {<Documentverification/>} />
        <Route path = '/sitter/sitterlogin' element = {<Sitterloginscreen/>} />
        <Route path = '/sitter/forgetpassword' element = {<Sitterforgetpassword/>} />
        <Route path = '/sitter/forget-otp' element = {<Sitterforgetotp/>} />
        <Route path = '/sitter/reset-password' element = {<Sitterresetpassword/>} />
        <Route path = '/sitter/sitterhome' element = {<Sitterdashboard/>} />



        <Route path = '' element = {<Sitterprivateroutes/>}>
        <Route path = '/sitter/viewprofile' element = {<Sitterviewprofile/>} />
        <Route path = '/sitter/slot' element = {<Sitterslotscreen/>} />
        <Route path = '/sitter/editslot/:slotId' element = {<Editslotscreen/>} />
        <Route path = '/sitter/edit-slots' element = {<Editslots/>} />
        <Route path = '/sitter/bookings' element = {<Bookings/>} />
        <Route path = '/sitter/chat' element = {<Sitterchat/>} />
        </Route>

        

        <Route path = '/parent/parentregister' element={<Parentregistration/>} />
        <Route path = '/parent/parentotp' element={<Otpscreen/>} />
        <Route path = '/parent/parentlogin' element = {<Parentlogin/>} />
        <Route path = '/parent/forgetpassword' element = {<Forgetpasswordscreen/>}/>
        <Route path = '/parent/forget-otp' element = {<Forgetotpscreen/>}/>
        <Route path = '/parent/resetpassword' element = {<Resetpasswordscreen/>} />
        <Route path = '/parent/babysitters' element = {<Babysitters/>} />
        


        <Route path = '' element = {<Parentprivateroutes/>}>
        <Route path = '/parent/viewprofile' element = {<Viewparentprofile/>} />
        <Route path = '/parent/confirmbooking' element = {<Bookingscreen/>} />
        <Route path = '/parent/checkout-success' element = {<Success/>} />
        <Route path = '/parent/chat' element = {<Chatscreen/>} />
        <Route path = '/parent/booking' element = {<Parentbookings/>} />
        <Route path = '/parent/wallet' element = {<Wallet/>} />
        </Route>



        <Route path = '/admin' element = {<Adminhomescreen/>} />
        <Route path = '/admin/adminregister' element = {<Adminregisterscreen/>} />
        <Route path = '/admin/login' element = {<Adminloginscreen/>} />
        <Route path = '/admin/adminhome' element = { <Adminscreen/> } />
        
      <Route element={<AdminprivateRoutes />}>
        <Route path = '/admin/adminhome/*' element = { <Adminscreen/> } >
          <Route path="manage-parent" element={<ManageParent />} />
          <Route path="manage-sittingcategories" element={<Managesittingcategory/>} />
          <Route path="add-category" element = {<Addsitcategory/>} />
          <Route path='edit-category/:categoryId' element = {<Editsittingcategory/>}/>
          <Route path="manage-childcategories" element = {<Managechildcategory/>} />
          <Route path="add-childcategory" element = {<Addchildcategory/>} />
          <Route path = "manage-sitters" element ={<Managesitter/>} />
        </Route>
      </Route>
      </Routes>
    </Router>
    </Provider>
  </React.StrictMode>
  </ChakraProvider>
  </SocketProvider>
);
