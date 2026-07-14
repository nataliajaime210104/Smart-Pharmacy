import {
 useState
} from "react";

import {
 Bot,
 Send,
 UserRound
} from "lucide-react";


import type {User} from "../../shared/types";


import {
 askPatientAssistant
} from "./services/patient-assistant.service";



interface Props{
 user:User;
}



function MedicalAssistantPage({user}:Props){


const [messages,setMessages]=useState<any[]>([

{
role:"assistant",
content:
"Hola 👋 soy tu asistente médico.\n\nPuedo ayudarte a consultar tus recetas, medicamentos, horarios e información de tu expediente."
}

]);


const [question,setQuestion]=useState("");

const [loading,setLoading]=useState(false);



async function send(){

  if(!question.trim()) return;

  const cleanQuestion = question.trim();

  setMessages(prev=>[
    ...prev,
    {
      role:"user",
      content:cleanQuestion
    }
  ]);

  setQuestion("");

  setLoading(true);

  try{

    const response = await askPatientAssistant({
      question: cleanQuestion,
      userId: user.id
    });


    setMessages(prev=>[
      ...prev,
      {
        role:"assistant",
        content: response.answer
      }
    ]);


  }catch(error){

    console.error(error);

    setMessages(prev=>[
      ...prev,
      {
        role:"assistant",
        content:"No pude consultar tu expediente."
      }
    ]);

  }
  finally{

    setLoading(false);

  }

}




return (

<div className="
bg-white
rounded-3xl
shadow-xl
overflow-hidden
h-[650px]
flex
flex-col
">


<div
className="
bg-gradient-to-r
from-blue-600
to-purple-600
text-white
p-5
flex
gap-3
"
>

<Bot/>

<div>

<h1 className="text-xl font-bold">
Mi asistente médico IA
</h1>


<p>
Consulta tus recetas y medicamentos
</p>


</div>


</div>




<div
className="
flex-1
overflow-y-auto
p-5
bg-gray-50
space-y-4
"
>


{
messages.map((msg,index)=>(


<div
key={index}
className={

msg.role==="user"

?
"flex justify-end"

:
"flex justify-start"

}
>


<div
className={

msg.role==="user"

?
"bg-blue-600 text-white p-4 rounded-2xl max-w-lg"

:
"bg-white shadow p-4 rounded-2xl max-w-lg"

}
>


<div className="flex gap-2">

{
msg.role==="user"
?
<UserRound size={18}/>
:
<Bot size={18}/>
}


<p>
{msg.content}
</p>


</div>


</div>


</div>


))
}



{
loading &&
<p>
🤖 Consultando expediente...
</p>
}


</div>





<form
onSubmit={(e)=>{

e.preventDefault();

send();

}}

className="
border-t
p-4
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

value={question}

onChange={
e=>setQuestion(e.target.value)
}

/>


<button

className="
bg-purple-600
text-white
px-5
rounded-xl
"

>

<Send/>

</button>


</form>



</div>


);


}


export default MedicalAssistantPage;