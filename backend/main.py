from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from pymongo import MongoClient
import random

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Connect to MongoDB
client = MongoClient("mongodb+srv://<username>:<password>@cluster0.mongodb.net/?appName=Cluster0")

db = client["ai_journal"]
entries_collection = db["entries"]

class JournalEntry(BaseModel):
    text: str
    date: str

@app.get("/")
def root():
    return {"message": "AI Journal Backend Running"}

# 🧠 AI emotion analyzer (simple simulation)
@app.post("/analyze")
def analyze(entry: JournalEntry):
    emotions = ["Happy", "Sad", "Angry", "Excited", "Calm", "Anxious"]
    emotion = random.choice(emotions)
    return {"emotion": emotion}

# 💾 Save entry to MongoDB
@app.post("/save_entry")
def save_entry(entry: JournalEntry):
    doc = {
        "text": entry.text,
        "date": entry.date,
        "created_at": datetime.now()
    }
    entries_collection.insert_one(doc)
    return {"message": "Entry saved successfully"}

# 📜 Get all entries
@app.get("/get_entries")
def get_entries():
    entries = list(entries_collection.find({}, {"_id": 0}))
    return {"entries": entries}
