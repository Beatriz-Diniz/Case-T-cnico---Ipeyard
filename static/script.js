let timeoutID;
let notHistory = true;
var newId = generateUUID(); // Gerando um ID único para o chat

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Function to scroll to the bottom of the messages div
function scrollDown() {
    var divMess = document.querySelector('.messagens');
    divMess.scrollTop = divMess.scrollHeight;
}

// Scroll down when the page loads
window.onload = function() {
    scrollDown();
};

// add user messagens
function userMessagens(inputText){
    let div = document.createElement('div');
    
    div.classList.add('userMessagens');
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordBreak = 'break-word';
    div.textContent = "You\n" + inputText;
    
    document.querySelector('.messagens').appendChild(div);
}

// add server messagens
function serverMessagens(response){
    let divBot = document.createElement('div');
    
    divBot.classList.add('botMessagens');
    divBot.style.whiteSpace = 'pre-wrap';
    divBot.style.wordBreak = 'break-word';
    divBot.textContent = "Bot\n" + response;
                    
    document.querySelector('.messagens').appendChild(divBot);
}


$(document).ready(function() {

    // Reset timer while user is typing
    $('.type_msg').on('keyup', function(event) {
        // send messagens with enter
        if (event.key === 'Enter' && $('textarea[name="text"]').val()[0] != '\n') {
            $('.sendMessagens').submit(); 
        }
        else{
            resetTimer();
        }
    });

    $('.sendMessagens').submit(function(e) {
        e.preventDefault();
        let inputText = $('textarea[name="text"]').val();

        // don't sent value == null
        if(inputText != ""){
            // add user messagens
            userMessagens(inputText);
            scrollDown();

            // send a messagen to server and recive a response
            $.ajax({
                type: 'POST',
                url: '/question',
                data: {text: inputText, chatId: newId},
                success: function(data) {
                    // add server messagens
                    serverMessagens(data.response);
                    scrollDown();
                }
            });

            // erase textarea value
            $('textarea[name="text"]').val('');
            resetTimer();
        }
    });
});

// Function to send a message after 10 seconds of inactivity
function sendAutomaticMessage() {
    $.ajax({
        success: function() {
            let divBot = document.createElement('div');
            divBot.classList.add('botMessagens');
            divBot.style.whiteSpace = 'pre-wrap';
            divBot.style.wordBreak = 'break-word';

            divBot.textContent = "Bot\n" + "Ei, você ainda está aí?";
            document.querySelector('.messagens').appendChild(divBot);
            timeoutID = setTimeout(closeServerAutomatic, 5000);
            scrollDown();
        }
    });
}

// Function to close server after 15 seconds of inactivity
function closeServerAutomatic(){
    $.ajax({
        success: function() {
            let divBot = document.createElement('div');
            divBot.classList.add('botMessagens');
            divBot.style.whiteSpace = 'pre-wrap';
            divBot.style.wordBreak = 'break-word';

            divBot.textContent = "Bot\n" + "Até logo! Estou finalizando nossa conversa";
            document.querySelector('.messagens').appendChild(divBot);
            scrollDown();

            // Disable the textarea
            let textarea = document.querySelector('.type_msg');
            textarea.placeholder = "";
            textarea.disabled = true;

            // Disable sent button
            let button = document.querySelector('buttonSend');
            button.disabled = true;
        }
    });
}

// Function to reset the timer
function resetTimer() {    
    clearTimeout(timeoutID);
    if(notHistory)
        timeoutID = setTimeout(sendAutomaticMessage, 10000); // 10 seconds in milliseconds
}

$(document).ready(function() {
    console.log("Chegou aqui");
    $.getJSON('/history', function(data) {
        console.log(data);
        if (data) {
            for (let chatId in data) {
                if (data.hasOwnProperty(chatId)) {
                    console.log(data[chatId][0].user);
                    let buttonHist = document.createElement('button');
                    buttonHist.classList.add('buttonHist'); 
                    buttonHist.setAttribute('type', 'button'); 
                    buttonHist.textContent = data[chatId][0].user;  

                    // Use uma função de fechamento para capturar o valor de chatId
                    (function(chatIdCopy) {
                        buttonHist.addEventListener('click', function() {
                            loadChat(chatIdCopy);
                        });
                    })(chatId);

                    document.querySelector('.messageList').appendChild(buttonHist);            
                }
            }
        }
    });
});

function loadChat(chatId) {
    console.log("Botao Funciona");
    $.ajax({
        type: 'POST',
        url: '/historyID',
        data: {id: chatId},
        success: function(data) {
            console.log("Só confirmand")
            console.log(data);
            // disable timer
            notHistory = false;

            // Clear chat
            var parentElements = document.getElementsByClassName('messagens');
            for (var i = 0; i < parentElements.length; i++) {
                parentElements[i].innerHTML = '';
            }

            for(let i = 0; i < data.length; i++){
                // add user messagens
                userMessagens(data[i].user);
                serverMessagens(data[i].bot);
                scrollDown();
            }

            // Disable the textarea
            let textarea = document.querySelector('.type_msg');
            textarea.placeholder = "";
            textarea.disabled = true;

            // Disable sent button
            let button = document.querySelector('buttonSend');
            button.disabled = true;
        }
    });
}


// Start the timer initially
resetTimer();
