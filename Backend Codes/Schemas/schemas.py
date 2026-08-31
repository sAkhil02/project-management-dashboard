from pydantic import BaseModel, field_validator, model_validator , ConfigDict
from typing import Optional, List
from decimal import Decimal
from icecream import ic
from datetime import datetime

def valid_str(ans: str, field: str) -> Optional[str]:
    if ans is None or ans == "":
        return None
    if not isinstance(ans, str):
        return {"error":f"{field} must be a string!"}
    return ans.strip()

def valid_int(ans: str, field: str) -> Optional[int]:
    if ans is None or ans == "": return None
    try: 
        return int(ans)
    except (ValueError, TypeError):
        return {"error":f"{field} must be a valid integer!"}

def valid_active(ans: str, field: str) -> Optional[int]:
    val = valid_int(ans, field)
    if val < 0 :
        return None
    if val is not None and val not in [0, 1]:
        return {"error":f"{field} must be 0 or 1"}
    return val

def valid_decimal(ans: str, field: str) -> Optional[Decimal]:
    if ans is None or ans == "": return None
    try:
        val = Decimal(ans)
        if val < 0:
            return None
        return val
    except Exception: 
        return {"error":f"{field} must be a decimal number."}

# --- Models --- #
class Add_Admin(BaseModel) :
    email : str
    phno : str
    curr_id : int

    # INT Validation
    @field_validator("curr_id" , mode = "before")
    @classmethod
    def check_p2_index(cls , ans):
        ans = valid_int(ans,field="Current's User ID")
        if ans >= 0 :
            return ans
        return {"error" : "Invalid Current User ID !"}

    # STRING Validation
    @field_validator("email","phno" , mode="before")
    @classmethod
    def validate_email_strings(cls, v, info):
        ans = valid_str(v, field=info.field_name.capitalize())
        return ans

    @field_validator("phno" , mode="before")
    @classmethod
    def validate_ph_strings(cls, v, info):
        ans = valid_str(v, field=info.field_name.capitalize())
        if not(len(ans) == 10 and ans.isdigit()) :
            return {"error" : "Enter valid phone no. !"}
        return ans

    @model_validator(mode = "after")
    def check_credntials(cls, values):
        if values.email is None:
            return {"error":"Enter Email !"}
        if values.phno is None:
            return {"error":"Enter Phone No. !"}
        if not (values.phno.isdigit() and len(values.phno)==10) :
            return {"error":"Invalid Phone no. !"}
        if  "@gmail.com" not in values.email:
            return {"error":"Invalid Email !"}

        return values

class Del_Admin(BaseModel) :
    id : Optional[int]
    curr_id : Optional[int]

    # INT Validation
    @field_validator("id" , mode = "before")
    @classmethod
    def check_p_index(cls , ans):
        ans = valid_int(ans,field="Admin ID")
        if ans < 0 :
            return None
        return ans 
    @field_validator("curr_id" , mode = "before")
    @classmethod
    def check_curr_index(cls , ans):
        ans = valid_int(ans,field="Current User ID")
        if ans < 0 :
            return None
        return ans

class Admin_Info(BaseModel):
    info : Optional[str] 
    pwd : Optional[str]

    # STRING Validation
    @field_validator("info","pwd" , mode="before")
    @classmethod
    def validate_p_strings(cls, v, info):
        ans = valid_str(v, field=info.field_name.capitalize())
        return ans

    @model_validator(mode = "after")
    def check_credntials(cls, values):
        if values.info is None:
            return {"error":"Enter either Email or Phone No. !"}
        if x := values.info:
            if not x.isdigit() and "@gmail.com" not in x:
                return {"error":"Invalid Input !"}
        if values.pwd is None : 
            return {"error":"Password cannot be empty !"}

        return values

class ForSearchMeth(BaseModel) :
    model_config = ConfigDict(from_attributes=True)
    ms_id : Optional[int] = None
    m_name : Optional[str] = None
    m_description : Optional[str] = None
    m_is_active : Optional[int] = None
    m_updated_by : Optional[str] = None

class ForSearchProj (BaseModel) :
    model_config = ConfigDict(from_attributes=True)
    id : Optional[int] = None
    name : Optional[str] = None
    description : Optional[str] = None
    priority : Optional[str] = None
    budget : Optional[Decimal] = None
    is_active : Optional[int] = None
    created_at : Optional[datetime] = None
    updated_by : Optional[str] = None
    methods : Optional[List[ForSearchMeth]] = None

class ForSearch (BaseModel):
    model_config = ConfigDict(extra="forbid")
    id : Optional[int] = None
    name : Optional[str] = None
    description : Optional[str] = None
    priority : Optional[str] = None
    budget : Optional[Decimal] = None
    is_active : Optional[int] = None
    updated_by : Optional[str] = None

    ms_id : Optional[int] = None
    m_name : Optional[str] = None
    m_description : Optional[str] = None
    m_is_active : Optional[int] = None
    m_updated_by : Optional[str] = None

    # INT Validation
    @field_validator("id" , mode = "before")
    @classmethod
    def check_p_index(cls , ans):
        ans = valid_int(ans,field="Project ID")
        if ans is None :
            return None
        if ans < 0 :
            return None
        return ans

    # 0 or 1 Validation
    @field_validator("is_active", mode = "before")
    @classmethod
    def check_p_activeness(cls , ans):
        ans = valid_int(ans , field="Project Active Status")
        if ans is None:
            return None
        if ans < 0:
            return None
        if ans not in [0, 1] :
            return {"error":"Project Active Status must be -1 ,0 or 1"}
        return ans

    # STRING Validation
    @field_validator("name", "description","priority","updated_by" , mode="before")
    @classmethod
    def validate_p_strings(cls, v, info):
        ans = valid_str(v, field=info.field_name.capitalize())
        return ans

    @field_validator("priority" , mode = "before")
    @classmethod
    def validate_priority(cls, v):
        ans = valid_str(v, field="Project Priority")
        if ans == "none" :
            return None
        return ans

    # Decimal Validation
    @field_validator("budget", mode="before")
    def validate_p_budget(cls, v):
        ans = valid_decimal(v, field="Project Budget")
        if ans is not None and ans < 0 :
            return None 
        else :
            return ans

    # INT Validation
    @field_validator("ms_id" , mode = "before")
    @classmethod
    def check_index(cls , ans):
        ans = valid_int(ans,field="Method ID")
        if ans is not None and ans < 0 :
            return None
        else :
            return ans

    # 0 or 1 Validation
    @field_validator("m_is_active", mode = "before")
    @classmethod
    def check_activeness(cls , ans):
        ans = valid_int(ans , field="Method Active Status")
        if ans is not None and ans not in [0, 1] :
            return {"error":"Method Active Status must be -1 ,0 or 1"}
        return ans

    # STRING Validation
    @field_validator("m_name", "m_description" ,"m_updated_by" , mode="before")
    @classmethod
    def validate_strings(cls, v, info):
        ans = valid_str(v, field=info.field_name.capitalize())
        return ans

class ForProject(BaseModel):
    name: Optional[str] = None
    is_active: Optional[int] = None
    priority: Optional[str] = None
    budget: Optional[Decimal] = None
    updated_by: Optional[str] = None
    description: Optional[str] = None

class ForProjectMethod(BaseModel):
    ms_id: Optional[int] = None
    m_name: Optional[str] = None
    m_is_active: Optional[int] = 1
    m_updated_by: Optional[str] = None
    m_description: Optional[str] = None

    @field_validator("ms_id", "m_is_active", mode="before")
    def validate_integers(cls, v, info):
        field_map = {"ms_id": "Method ID", "m_is_active": "Method Active Status"}
        field = field_map.get(info.field_name, info.field_name)
        return valid_int(v, field) if info.field_name == 'ms_id' else valid_active(v, field)

    @field_validator("m_name", "m_updated_by", "m_description", mode="before")
    def validate_strings(cls, v, info):
        return valid_str(v, field=info.field_name)

class Request(BaseModel):
    proj_id: Optional[int] = 0
    proj_name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[int] = 1
    proj_priority: Optional[str] = "low"
    proj_budget: Optional[Decimal] = Decimal("0.0")
    updated_by: Optional[str] = None
    proj_ms: Optional[List[ForProjectMethod]] = None

    @model_validator(mode = "after")
    def check_business_rules(cls, values):
        ic(values)
        cond = all([values.proj_id == 0 , values.proj_name == None , values.description == None , values.updated_by == None , values.proj_ms == None])
        if cond:
            return {"error":"Enter Something!"}
        is_update = values.proj_id is not None and values.proj_id > 0
        
        if values.proj_ms:
            for method in values.proj_ms:
                if method.ms_id is not None and method.ms_id > 0:
                    if not method.m_updated_by:
                        return {"error":f"Method with ID {method.ms_id} requires 'm_updated_by' for updates."}
                else:
                    if not method.m_name:
                        return {"error":"New methods require Name."}
                    if not method.m_description :
                        return {"error":"New methods require Description."}

        if is_update:
            project_fields_to_update = [
                values.proj_name, values.description, values.is_active,
                values.proj_priority, values.proj_budget , values.updated_by
            ]
            is_project_update = any(field is not None for field in project_fields_to_update)
            is_method_update = bool(values.proj_ms)

            if not is_project_update and not is_method_update:
                return {"error":"For project updates, provide at least one project field or method to update."}
            if values.updated_by is None or not values.updated_by:
                return {"error":"For Project updation, 'updated_by' is mandatory."}
        else:
            if not values.proj_name:
                return {"error":"For Project creation, 'proj_name' is mandatory."}
            if not values.description:
                return {"error":"For Project creation, 'description' is mandatory."}

        return values

    @field_validator("proj_id", "is_active", mode="before")
    def validate_integers(cls, v, info):
        field_map = {"proj_id": "Project ID", "is_active": "Project Active Status"}
        field = field_map.get(info.field_name)
        return valid_int(v, field) if info.field_name == 'proj_id' else valid_active(v, field)
    
    @field_validator("proj_budget", mode="before")
    def validate_budget(cls, v):
        ans = valid_decimal(v, field="Budget")
        return ans

    @field_validator("proj_name", "description", "updated_by", mode="before")
    def validate_strings(cls, v, info):
        return valid_str(v, field=info.field_name)

    @field_validator("proj_priority", mode="before")
    def validate_prior(cls, v, info):
        ans = valid_str(v, field=info.field_name)
        if ans == "none" :
            return None
        return ans