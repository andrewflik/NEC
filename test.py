from flask import Flask, render_template, request, jsonify
import requests
import json

app = Flask(__name__)


@app.route('/')
def index():
	
    return render_template('search_result.html')

if __name__ == '__main__':
    print("Starting Server...")
    app.run(port = 5000, debug=True)
