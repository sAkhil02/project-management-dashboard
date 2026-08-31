from sqlmodel import Session
from Schemas.schemas import Request, ForProject 
from Models.model import AdminInfo
from Repositories.repo import *
from passlib.context import CryptContext
from icecream import ic

def main_service(data: Request, session: Session):
    ic(data)
    if "error" in data : return data 
    msg = {}
    is_update = data.proj_id and data.proj_id is not None and data.proj_id > 0

    if not is_update:
        # --- Creation Part --- #
        msg_for_creation = {"Project": {}, "Project_Method": []}
        
        project_dto = ForProject(
            name=data.proj_name,
            description=data.description,
            priority=data.proj_priority,
            budget=data.proj_budget
        )
        new_project = create_proj_record(project_dto, session)
        msg_for_creation["Project"] = {"message":"Project created successfully"}

        if data.proj_ms:
            for method_data in data.proj_ms:
                if method_data.ms_id is None or method_data.ms_id == 0:
                    new_method = create_proj_method_record(method_data, new_project.id, session)
                    msg_for_creation["Project_Method"].append(new_method)
        
        msg["Creation_Part"] = msg_for_creation

    else:
        # --- Updation Part --- #
        msg_for_updation = {"Project": {}, "Project_Method": []}

        project_fields_provided = any([
            data.proj_name is not None, data.description is not None, data.is_active is not None,
            data.proj_priority is not None, data.proj_budget is not None
        ])

        if project_fields_provided:
            project_new = ForProject(
                name=data.proj_name, 
                description=data.description, 
                priority=data.proj_priority,
                budget=data.proj_budget, 
                updated_by=data.updated_by, 
                is_active=data.is_active
            )
            updated_project = update_proj_record(data.proj_id, project_new, session)
            if not updated_project:
                return {"error" : f"Project with ID {data.proj_id} not found for update."}
            msg_for_updation["Project"] = {"message":"Project updated successfully"}
        
        if data.proj_ms:
            if not get_project_by_id(data.proj_id, session):
                return {"error" : f"Project with ID {data.proj_id} not found."}

            method_list = []
            for method_data in data.proj_ms:
                ms_id = method_data.ms_id
                if ms_id is not None and ms_id > 0: # Update
                    updated_method = update_proj_method_record(ms_id, method_data, session)
                    if not updated_method:
                        method_list.append({"error": f"Method with ID {ms_id} not found."})
                    else:
                        method_list.append({"message" : "Method updated successfully"})

                elif ms_id is None or ms_id == 0: # Create
                    new_method = create_proj_method_record(method_data, data.proj_id, session)
                    method_list.append({"message" : "Method created successfully"})
            msg_for_updation["Project_Method"] = method_list
            
        msg["Updation_Part"] = msg_for_updation
        
    return msg

def search_info(data , session) :
    data = search(data , session)
    ic(data)
    return data

def check_admin(data , session):
    pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    hash_pwd = pwd_context.hash("123456")
    
    query = select(AdminInfo).where(or_(AdminInfo.phno == data.info , AdminInfo.email == data.info))
    admin = session.exec(query).first()
    ic(admin)
    
    if not admin:
        return {"error" : "Admin not found !"}
    all_admin = session.exec(query).all()
    if len(all_admin) > 1 :
        return {"error" : "Duplicate user found using same email or name!"}
    if not pwd_context.verify(data.pwd , hash_pwd) :
        return {"error" : "Password Verification Failed !"}
    return for_admin_table(data , session)  

def for_add_admin(data , session) :
    query = select(AdminInfo).where(or_(AdminInfo.phno == data.phno , AdminInfo.email == data.email))
    admin = session.exec(query).all()

    if admin:
        return {"error" : "Duplicate user found using same email or phone no. !"}
    else:
        return for_adding_admin(data , session)

def for_del_admin(data , session) :
    query1 = select(AdminInfo).where(AdminInfo.id == data.id)
    record = session.exec(query1).first()

    query2 = select(AdminInfo).where(AdminInfo.id == data.curr_id)
    curr = session.exec(query2).first()
    
    if record :
        if record.order_no == 0 : 
            return {"error" : "Can't remove Owner !"}
        if record.order_no <= curr.order_no :
            return {"error" : "Can't remove your Superior or College "}
        return for_deleting_admin(data.id, session)
    else :
        return {"error" : "Record not found !"}

def for_show_record(session) :
    return all_admin_records(session)

def get_proj(no ,session):
    if no > -1 :
        return only_proj(no ,session)
    return {"error" : "Index cannot be negative !"}

def get_meth(no ,session) :
    if no > -1 :
        return only_meth(no ,session)
    return {"error" : "Index cannot be negative !"}

def del_proj(p_no , session) :
    if p_no > -1 :
        return delete_proj(p_no , session)
    return {"error" : "Index cannot be negative !"}

def del_meth(m_no , session) :
    if m_no > -1 :
        return delete_meth(m_no , session)
    return {"error" : "Index cannot be negative !"}