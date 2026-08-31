import axios from 'axios' ;

const url = import.meta.env.VITE_API_URL as string;

const api = axios.create({baseURL : url,});

export interface ForLogin {
    info? : string ;
    pwd : string ;
}

export interface ForMeth {
    ms_id? : number
    m_name? : string
    m_is_active? : string
    m_updated_by? : string
    m_description? : string
}

export interface ForProj {
    proj_id? : string ;
    proj_name? : string ;
    description? : string ;
    is_active? : string ;
    proj_priority? : string ;
    proj_budget? : string ;
    updated_by? : string ;
    proj_ms? : ForMeth[] ;
}

export interface OnlyProj {
    proj_id? : string ;
    proj_name? : string ;
    description? : string ;
    is_active? : string ;
    proj_priority? : string ;
    proj_budget? : string ;
    created_at? : string ;
    updated_by? : string ;
    proj_ms? : ForMeth[] ;
}

export interface OnlyMeth {
    ms_id? : number ;
    proj_id? : number ;
    created_at? : string ;
    updated_at? : string ;
    m_name? : string ;
    m_is_active?: string ;
    m_description? : string ;
    m_updated_by? : string ;
}

export interface ForSearch {
    id? : string ;
    name? : string ;
    description? : string ;
    priority? : string ;
    budget? : string ;
    is_active? : string ;
    updated_by? : string ;

    ms_id? : string ;
    m_name? : string ;
    m_description? : string ;
    m_is_active? : string ;
    m_updated_by? : string ;

}

export interface AddAdmin {
    email? : string ;
    phno? : string ;
    curr_id? : number ;
}

export interface DelAdmin {
    id? : number ;
    curr_id? : number ;
}

export interface Admin {
    id? : number ;
    email? : string ;
    phno? : string ;
    created_at? : string ;
    last_login? : string ;
    order_no? : number ;
}

// Apis used in Project Management
export async function Master_API (info : ForProj){
    const resp = await api.post('/Master_API' , info)
    return resp.data;
}

export async function Search_Info (info : ForSearch){
    const resp = await api.post('/Search_Info' , info)
    return resp.data;
}

export async function Get_Projs (id : number | undefined) {
    const resp = await api.get('Get_Only_Projects', { params: { id } })
    return resp;
}

export async function Get_Meths (id : number | undefined) {
    const resp = await api.get('Get_Only_Methods', { params: { id } })
    return resp;
}

export async function Del_Proj (id : number) {
    const resp = await api.delete('Del_Project' , {params : {id}})
    return resp;
}

export async function Del_Meth (id : number) {
    const resp = await api.delete('Del_Method' , { params : { id }})
    return resp ;
} 

// Api used in Admin Management
export async function Admin_check (info : ForLogin){
    const resp = await api.post('/Admin_check' , info);
    return resp.data ;
}

export async function Add_Admin (info : AddAdmin){
    const resp = await api.post('/Add_Admin' , info)
    return resp.data ;
}

export async function Delete_Admin (info : DelAdmin){
    const resp = await api.delete('/Del_Admin', { data: info })
    return resp.data ;
}

export async function All_Admin () {
    const resp = await api.get('/All_Admin')
    return resp.data ;
}