from fastapi import Depends ,FastAPI 
from sqlmodel import Session 
from Schemas.schemas import Request , ForSearch , Admin_Info ,Add_Admin ,Del_Admin
from Services.service import *
from Database.database import get_session
from fastapi.middleware.cors import CORSMiddleware
from icecream import ic

app = FastAPI(swagger_ui_parameters={"tryItOutEnabled": True,})

app.add_middleware(
    CORSMiddleware,
    allow_origins="http://localhost:5173",
    allow_credentials=True,
    allow_methods=["*"],    # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],    # Allows all headers
)

@app.post("/Master_API")
def master_api(data : Request , session : Session = Depends(get_session)):
    return main_service(data ,session)

@app.get("/Get_Only_Projects")
def get_only_projects(id : int ,session : Session = Depends(get_session)):
    return get_proj(id ,session)

@app.get("/Get_Only_Methods")
def get_only_methods(id : int ,session : Session = Depends(get_session)):
    return get_meth(id ,session)

@app.delete("/Del_Project")
def del_only_proj(id : int ,session : Session = Depends(get_session)):
    return del_proj(id , session)

@app.delete("/Del_Method")
def del_only_meth(id : int , session : Session = Depends(get_session)):
    return del_meth(id , session)

@app.post("/Search_Info")
def search_information(info : ForSearch , session : Session = Depends(get_session)) :
    ic(info)
    return search_info(info , session)

@app.post("/Admin_check")
def admin_check(credits : Admin_Info , session : Session = Depends(get_session)):
    ic(credits)
    resp = check_admin(credits , session)
    return resp

@app.post("/Add_Admin")
def add_admin(credits : Add_Admin , session : Session = Depends(get_session)):
    ic(credits)
    resp = for_add_admin(credits , session)
    return resp

@app.delete("/Del_Admin")
def del_admin(credits : Del_Admin , session : Session = Depends(get_session)):
    resp = for_del_admin(credits , session)
    ic(resp)
    return resp

@app.get("/All_Admin")
def show_all_admins(session : Session = Depends(get_session)) :
    resp = for_show_record(session)
    return resp