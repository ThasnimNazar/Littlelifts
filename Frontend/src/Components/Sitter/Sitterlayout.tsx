import React from 'react';
import Sitterheader from "../../Layouts/Adminlayouts/Sitter/Sitterheader";
import Sidemenu from "../../Components/Sitter/Sidemenu";

const Sitterlayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Sitterheader />
      <div className="flex h-screen bg-white">
        <div className="hidden md:flex flex-col w-64 bg-white text-black">
          <Sidemenu />
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sitterlayout;
