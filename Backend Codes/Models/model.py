from sqlmodel import Field, SQLModel , Relationship
from datetime import datetime
from typing import Optional , List
from decimal import Decimal

class ProjectMethod(SQLModel , table = True):
    __tablename__ = "project_methods"
    
    ms_id: Optional[int] = Field(primary_key=True)
    proj_id : Optional[int] = Field(foreign_key="project.id")
    created_at : Optional[datetime] = None
    updated_at : Optional[datetime] = None 
    
    m_name : Optional[str] 
    m_is_active : Optional[int] = Field(default=0)
    m_description : Optional[str] 
    m_updated_by : Optional[str]

    project: Optional["Project"] = Relationship(back_populates="methods")

class Project(SQLModel , table = True):
    __tablename__ = "project"

    id: Optional[int] = Field(primary_key=True)
    created_at : Optional[datetime] = None
    updated_at : Optional[datetime] = None
    
    name : Optional[str] 
    description : Optional[str] 
    is_active : Optional[int] = Field(default=1 , max_length=1)
    priority : Optional[str] 
    budget : Optional[Decimal] = Field(decimal_places = 4)
    updated_by : Optional[str]

    methods : List[ProjectMethod] = Relationship(back_populates = "project")

#####
class AdminInfo(SQLModel , table = True) :
    __tablename__ = "master_admin"

    id : Optional[int] = Field(primary_key = True)
    email : Optional[str] = None
    phno : Optional[str] = None
    created_at : Optional[datetime]
    last_login : Optional[datetime]
    order_no : Optional[int]