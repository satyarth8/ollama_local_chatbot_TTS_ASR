// Automatic Speech Recognition

const micIcon = document.getElementById("micIcon")
const textArea = document.getElementById("textArea")

let micState = false //by default mic is off
micIcon.src= "./Mic OFF.svg" // the intial is of mic off

// Check for browser support
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.continuous = true;

// This event fires when the API gets a result
recognition.addEventListener('result', e => {
    const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

    textArea.value = transcript;
    console.log(transcript);
});


function throttle(func, delay) {
    let timeout=null
    return (...args) => {
        if(!timeout) {
            func(...args)
            timeout=setTimeout(() => {
                timeout=null
            }, delay)
        }
    }
}

function micOnOff(){
    micState =!micState
    console.log(micState)
    if(micState===true){
        micIcon.src = "./Mic ON.svg"
        recognition.start();
    }else{
        micIcon.src= "./Mic OFF.svg"
        recognition.stop(); 
    }
}

const throttleMicState = throttle(micOnOff,500)

micIcon.addEventListener('click', () => {
    throttleMicState()
})


recognition.addEventListener('end', () => {
    if (micState) {
        setTimeout(() => recognition.start(), 300);
    }
});

recognition.addEventListener('error', e => {
    console.error('Speech Recognition Error:', e.error);
    micIcon.src = "./Mic OFF.svg";
    micState = false;
});

