from flask import Flask, render_template, request, jsonify
import requests
import json
from twilio.rest import Client
import googlemaps

account_sid = "AC6b46e74d4a54465a3e4fc824849d121a"
auth_token  = "e4ef218b04c5f93d7eba8b17a94ba1c3"

api_key = "AIzaSyBRl0KG9bvh6DD4kGVoTqM2aRLfjw40VNk"
gmaps = googlemaps.Client(key=api_key)

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('form.html')


@app.route('/process', methods=['POST', 'GET'])
def process():
    if request.method == 'POST':
        email = request.form['email']
        name = request.form['name']
        client = Client(account_sid, auth_token)
        message = client.messages.create(
        to = "+91" + str(email),
        from_="+13346002011",
        body = str(name) + " Ticket has been Booked! QR Code "  )
        data = "OTP has been sent to " + str(email);
        if name and email:
            return jsonify({'name' : data})

    return jsonify({'error' : 'Missing data!'})

@app.route('/button', methods=['POST', 'GET'])
def button():
    if request.method == 'POST':
        return render_template('search_result.html')

if __name__ == '__main__':
    print("Starting Server...")
    app.run(port = 5000, debug=True)
