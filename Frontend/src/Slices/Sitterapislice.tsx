
import { apiSlice } from "./Apislice";

const SITTER_URL = '/api/sitter'

export const Sitterapislice = apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        sitterlogout:builder.mutation({
            query:(data)=>({
                url:`${SITTER_URL}/logout`,
                method:'POST',
                body:data
            })
        }),
    })
})

export const { useSitterlogoutMutation } = Sitterapislice

