import os
import json

from flask import Flask
from flask_cors import CORS
from deta import Deta

deta = Deta(os.environ["DETA_AK"])
puzzles = deta.Base("puzzles")

app = Flask(__name__)
CORS(app)


@app.route("/get-puzzle", methods=["GET"])
def get_puzzle():
    puzzle = puzzles.fetch({"name": "test"}).items[0]["puzzle"]
    return {"map": json.loads(puzzle)}
