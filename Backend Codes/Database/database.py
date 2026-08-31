from sqlmodel import Session, create_engine, SQLModel

url = "postgresql+psycopg2://postgres:Satya123@localhost:5432/postgres"
engine = create_engine(url, echo=True)

#SQLModel.metadata.create_all(engine)

def get_session():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()