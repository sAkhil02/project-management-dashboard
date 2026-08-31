from datetime import datetime
from Models.model import Project, ProjectMethod ,AdminInfo
from Schemas.schemas import ForProject, ForProjectMethod ,ForSearchProj, ForSearchMeth
from sqlmodel import Session , select , SQLModel
from typing import Optional 
from sqlalchemy import or_ , delete
from sqlalchemy.orm import selectinload
from icecream import ic

# from Database.database import engine 
# SQLModel.metadata.create_all(engine)

def get_project_by_id(ind: int, session: Session) -> Optional[Project]:
    return session.get(Project, ind)

def create_proj_record(data: ForProject, session: Session) -> Project:
    user = Project(
        name=data.name,
        description=data.description,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        is_active=1,
        priority=data.priority,
        budget=data.budget,
        updated_by=None
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def create_proj_method_record(data: ForProjectMethod, proj_id: int, session: Session) -> ProjectMethod:
    user = ProjectMethod(
        proj_id=proj_id,
        m_name=data.m_name,
        m_description=data.m_description,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        m_is_active=1,
        m_updated_by=None
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"message" : "Created Methods Successfully !"}

def update_proj_record(ind: int, data: ForProject, session: Session) -> Optional[Project]:
    user = session.get(Project, ind)
    if not user:
        return None

    update_data = data.model_dump(exclude_unset=True, exclude_none=True)
    for key, value in update_data.items():
        if key != 'updated_by':
            setattr(user, key, value)
    
    user.updated_at = datetime.now()
    user.updated_by = data.updated_by
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"message" : "Updated Project Successfully !"}

def update_proj_method_record(ind: int, data: ForProjectMethod, session: Session) -> Optional[ProjectMethod]:
    user = session.get(ProjectMethod, ind)
    if not user:
        return None

    update_data = data.model_dump(exclude_unset=True, exclude_none=True)
    for key, value in update_data.items():
        if key != 'm_updated_by':
            setattr(user, key, value)

    user.updated_at = datetime.now() 
    user.m_updated_by = data.m_updated_by
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"message" : "Updated Methods Successfully !"}

def get_all_records(session):
    query = select(Project).options(selectinload(Project.methods))
    projects = session.exec(query).unique().all()
    l_proj = [ForSearchProj.model_validate(each) for each in projects]
    return l_proj

def only_proj(ind ,session):
    query = select(Project).options(selectinload(Project.methods))
    if ind != 0 : 
        query = query.where(Project.id == ind)
    projs = session.exec(query).unique().all()
    l_projs = [ForSearchProj.model_validate(each) for each in projs]
    if l_projs :
        return l_projs
    else :
        return {"error" : "Project Not Found !"}


def only_meth(ind , session) :
    query = select(ProjectMethod)
    if ind != 0 : 
        query = query.where(ProjectMethod.proj_id == ind)
    meths = session.exec(query).all()
    if meths :
        return meths
    else :
        return {"error" : "Method Not Found !"}

def delete_proj(p_ind , session) :
    record = session.get(Project,p_ind)
    if record:
        query = delete(ProjectMethod).where(ProjectMethod.proj_id == p_ind)
        session.exec(query)
        session.commit()

        query = delete(Project).where(Project.id == p_ind)
        session.exec(query)
        session.commit()
        return {"message" : "Project Deleted successfully !"}
    return {"error" : "Project not found !"}

def delete_meth(m_ind , session) :
    record = session.get(ProjectMethod,m_ind)
    if record:
        query = delete(ProjectMethod).where(ProjectMethod.ms_id == m_ind)
        session.exec(query)
        session.commit()
        return {"message" : "Methods Deleted successfully !"}
    return {"error" : "Project not found !"}

def search(data, session):
    data = data.model_dump(exclude_none=True)
    ic(data)
    if not data: return get_all_records(session)
    p_ids, m_ids = None, None
    for k, v in data.items():

        if hasattr(Project, k):
            query = select(Project.id)
            if k == "name":
                pattern = f"%{str(v).lower()}%"
                query = query.where(
                    or_(Project.name.ilike(pattern), Project.description.ilike(pattern))
                )
            elif k not in ["id", "is_active", "budget"]:
                query = query.where(getattr(Project, k).ilike(f"%{str(v).lower()}%"))
            else:
                if not (k == "is_active" and v == -1):
                    query = query.where(getattr(Project, k) == v)
            id = set(session.exec(query).all())

            if p_ids is None: p_ids = id
            else: p_ids &= id

        if hasattr(ProjectMethod, k):
            query = select(ProjectMethod.ms_id)
            if k not in ["ms_id", "m_is_active"]:
                query = query.where(getattr(ProjectMethod, k).ilike(f"%{str(v).lower()}%"))
            else:
                if not (k == "m_is_active" and v == -1):
                    query = query.where(getattr(ProjectMethod, k) == v)
            id = set(session.exec(query).all())

            if m_ids is None: m_ids = id
            else: m_ids &= id

    if not p_ids and not m_ids: return {"projects": [], "methods": []}

    d = dict()
    if p_ids:
        query = select(Project).where(Project.id.in_(list(p_ids))).options(selectinload(Project.methods))
        p_data = session.exec(query).unique().all()
        ic(p_data)
        d["projects"] = [ForSearchProj.model_validate(each) for each in p_data]

    if m_ids:
        query = select(ProjectMethod).where(ProjectMethod.ms_id.in_(list(m_ids)))
        m_data = session.exec(query).unique().all()
        ic(m_data)
        d["methods"] = [ForSearchMeth.model_validate(each) for each in m_data]

    return d

def for_adding_admin(data,session) :
    query = select(AdminInfo.order_no).where(AdminInfo.id == data.curr_id)
    ord_no = session.exec(query).first()

    admin_info = AdminInfo(
        email = data.email ,
        phno = data.phno ,
        created_at = datetime.now() ,
        last_login = datetime.now() ,
        order_no = (ord_no + 1)
    )
    session.add(admin_info)
    session.commit()
    session.refresh(admin_info)
    return {"Message" : "Admin Added Sucessfully !"}

def for_admin_table(data,session):
    query = select(AdminInfo).where(or_(AdminInfo.email == data.info , AdminInfo.phno == data.info))
    user = session.exec(query).first()
    name = user.email
    id = user.id 
    user.last_login = datetime.now()

    session.add(user)
    session.commit()
    session.refresh(user)
    return {"email" : name , "id" : id}

def for_deleting_admin(id , session) :
    record = session.get(AdminInfo,id)
    if record:
        session.delete(record)
        session.commit()
        return {"message" : "Deleted successfully !"}
    return {"error" : "Record not found !"}

def all_admin_records(session):
    query = select(AdminInfo)
    records = session.exec(query).all()
    if records :
        return records
    else :
        return {"error" : "No available Records !"}