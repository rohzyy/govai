from backend.database import engine, Base
from backend.models import GrievanceTimeline

print("Creating new tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
