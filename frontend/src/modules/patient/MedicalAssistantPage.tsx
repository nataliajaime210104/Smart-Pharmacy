import { useState } from "react";
import { Send, Bot } from "lucide-react";

import type { User } from "../../shared/types";

import {
 askPatientAssistant
} from "./services/assistant.service";


interface Props{
 user:User;
}


function MedicalAssistantPage({user}:Props){


const [message,setMessage]=useState("");

const [messages,setMessages]=useState<any[]>([
{
 role:"bot",
 text:
 "Hola 👋 soy tu asistente médico. Puedo ayudarte con tus recetas, medicamentos y expediente clínico."
}
]);


const [loading,setLoading]=useState(false);



async function sendMessage(){


if(!message.trim()) return;


const question=message;


setMessages(prev=>[
...prev,
{
 role:"user",
 text:question
}
]);


setMessage("");

setLoading(true);



try{


const response=
await askPatientAssistant(
question,
user.id
);



setMessages(prev=>[
...prev,
{
 role:"bot",
 text:response.message
}
]);



}catch(error){


setMessages(prev=>[
...prev,
{
 role:"bot",
 text:"No pude consultar tu información médica."
}
]);


}
finally{

setLoading(false);

}


}




return(

<div
className="
h-[600px]
bg-white
rounded-3xl
shadow-xl
flex
flex-col
overflow-hidden
"
>


{/* HEADER */}

<div
className="
bg-gradient-to-r
from-purple-600
to-blue-600
p-5
text-white
flex
gap-3
items-center
"
>

<Bot/>

<div>

<h1 className="font-bold text-xl">
Asistente Médico IA
</h1>

<p className="text-sm">
Basado en tu expediente clínico
</p>

</div>


</div>





{/* MENSAJES */}

<div
className="
flex-1
p-5
space-y-4
overflow-y-auto
bg-gray-50
"
>


{
messages.map(
(item,index)=>(


<div
key={index}
className={

item.role==="user"

?

"flex justify-end"

:

"flex justify-start"

}

>


<div
className={

item.role==="user"

?

"bg-blue-600 text-white p-3 rounded-2xl max-w-md"

:

"bg-white shadow p-3 rounded-2xl max-w-md"

}

>

{item.text}

</div>


</div>


))
}



{
loading &&
<p>
🤖 Analizando expediente...
</p>
}



</div>






{/* INPUT */}

<div
className="
p-4
border-t
flex
gap-3
"
>


<input

className="
flex-1
border
rounded-xl
px-4
"

placeholder="
Pregunta sobre tus medicamentos...
"

value={message}

onChange={
e=>setMessage(e.target.value)
}

/>


<button

onClick={sendMessage}

className="
bg-purple-600
text-white
rounded-xl
px-5
"

>

<Send/>

</button>


</div>



</div>


);


}


export default MedicalAssistantPage;