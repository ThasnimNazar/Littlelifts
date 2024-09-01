import { apiSlice } from "./Apislice";

const PARENT_URL = 'http://localhost:5003/api/parent'

export const Parentapislice = apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        parentregister:builder.mutation({
            query:(data)=>({
                url:`${PARENT_URL}/register-parent`,
                method:'POST',
                body:data
            })
        }),
        parentlogin:builder.mutation({
            query:(data)=>({
                url:`${PARENT_URL}/login-parent`,
                method:'POST',
                body:data
            })
        }),
        parentlogout:builder.mutation({
            query:(data)=>({
                url:`${PARENT_URL}/logout`,
                method:'POST',
                body:data
            })
        }),
    })
})

export const { useParentregisterMutation,useParentlogoutMutation,useParentloginMutation } = Parentapislice
