import { apiSlice } from "./Apislice";
import { ObjectId } from "mongoose";

export interface AdminRegisterData {
    name: string;
    email: string;
    password: string;
    adminRegistrationKey: string;
  } //the shape of the data we are going to send

export interface Admin {
    _id: ObjectId;
    name: string;
    email: string;
  }

export interface AdminRegisterResponse {
    message: string;
    admin: Admin;
  }
//the response data we are dispatching to the store


export interface AdminloginData{
  email:string;
  password:string;
}

export interface AdminLogoutResponse{
  message:string;
}

const ADMIN_URL = '/api/admin'

export const Adminapislice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      adminregister: builder.mutation<AdminRegisterResponse, AdminRegisterData>({ //this specifies that the mutation will accept the data of this type and retrive response of this type.
        query: (data) => ({
          url: `${ADMIN_URL}`,
          method: 'POST',
          body: data,
        }),
      }),
      adminlogin: builder.mutation<AdminRegisterResponse, AdminloginData>({ //this specifies that the mutation will accept the data of this type and retrive response of this type.
        query: (data) => ({
          url: `${ADMIN_URL}/login`,
          method: 'POST',
          body: data,
        }),
      }),
      logoutadmin:builder.mutation({
        query:(data)=>({
            url:`${ADMIN_URL}/logout`,
            method:'POST',
            body:data
        })
    }),
    }),
  });
  
  export const { useAdminregisterMutation,useAdminloginMutation,useLogoutadminMutation } = Adminapislice;