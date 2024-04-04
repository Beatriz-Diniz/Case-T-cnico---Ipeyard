import json
import os
from flask import Flask, render_template, request, jsonify
from langchain_openai import ChatOpenAI
from langchain_community.callbacks import get_openai_callback

# inicilization flask
app = Flask(__name__, static_folder='static')

# Dicionário para armazenar instâncias de ChatOpenAI por userId
chatInstances = {}

# Instance LLM
def get_chat_instance(userId):
    if userId not in chatInstances:
        chatInstances[userId] = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0.2)
    return chatInstances[userId]

# to do questions
def question(text, userId):
    llm = get_chat_instance(userId)
    print("LLM: ", llm)
    res = llm.invoke(text)
    return res

# Function to load the conversation history from the JSON file
def load_history():
    if os.path.exists('history.json'):
        with open('history.json', 'r') as file:
            return json.load(file)
    else:
        return {}

# Function to save the conversation history to the JSON file
def save_history(history):
    with open('history.json', 'w') as file:
        json.dump(history, file, indent=4)


# load history when started
history = load_history()

# Main route that renders the HTML template
@app.route("/")
def index():
    return render_template("main.html")
    
# Route to receive new messages and add them to the history
@app.route('/question', methods=['POST'])
def response():
    questionUser = request.form['text']
    chat_id = request.form['chatId']
    res = question(questionUser, chat_id).content

    history = load_history()
    if chat_id not in history:
        history[chat_id] = []

    history[chat_id].append({'user': questionUser, 'bot': res})
    save_history(history)

    return jsonify({'response': res})

# Route to print history
@app.route('/history')
def history():
    history = load_history()
    return jsonify(history)

# Route to retrieve the conversation history
@app.route('/historyID', methods=['POST'])
def get_history():
    history = load_history()
    chat_id = request.form['id']
    
    if chat_id in history:
        return jsonify(history[chat_id])
    else:
        return jsonify([])
    

if __name__=="__main__":
    app.run(debug=True)