import { useEffect, useState } from "react";
import { Download, Pill, Search } from "lucide-react";
import type { User } from "../../shared/types";

import {
  getMyPrescriptions,
  getPrescriptionPdfUrl,
} from "./services/patient.service";

interface Props {
  user: User;
}


function MyPrescriptionsPage({user}: Props) {

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  async function loadPrescriptions() {
    try {
      const response = await getMyPrescriptions(user.id);

      setPrescriptions(response.data);

    } catch (error) {
      console.error(
        "Error cargando recetas:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  loadPrescriptions();

}, [user.id]);


  const filtered = prescriptions.filter(
    (item)=> 
      item.folio
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );


  if(loading){

    return (
      <div className="page-card">
        Cargando recetas...
      </div>
    );

  }


  return (

<div className="space-y-6">


  {/* ENCABEZADO */}

  <div
    className="
    bg-red-500
    text-white
    text-5xl
    p-10
    "
  >

  

    <h1 className="
      text-4xl 
      font-bold
      flex 
      items-center 
      gap-3
    ">

      <Pill size={40}/>

      Mis recetas médicas

    </h1>


    <p className="mt-3 text-blue-100">

      Consulta tus medicamentos,
      indicaciones y tratamientos actuales.

    </p>


  </div>





  {/* BUSCADOR */}

  <div className="relative">

    <Search
      className="
      absolute 
      left-4 
      top-3.5 
      text-gray-400
      "
    />


    <input

      className="
      w-full
      rounded-2xl
      border
      bg-white
      p-3
      pl-12
      shadow-sm
      focus:ring-2
      focus:ring-blue-400
      outline-none
      "

      placeholder="Buscar por folio..."

      value={search}

      onChange={
        e=>setSearch(e.target.value)
      }

    />


  </div>






{
filtered.length === 0 ? (

<div
className="
bg-white
rounded-3xl
p-10
text-center
shadow
"
>

<p className="text-gray-500 text-lg">

No tienes recetas disponibles.

</p>


</div>


)

:


filtered.map(recipe=>(

<div

key={recipe.id}

className="
bg-red-500
text-white
p-10
rounded-3xl
shadow-2xl
border-4
border-black
"

>

{/* CABECERA RECETA */}

<div

className="
bg-gradient-to-r
from-slate-800
to-blue-700
p-6
text-white
flex
justify-between
items-center
"

>


<div>


<h2 className="
text-2xl
font-bold
">

💊 Receta {recipe.folio}

</h2>


<p className="mt-2 text-blue-100">

Tratamiento médico

</p>


</div>




<span

className={`

px-4
py-2
rounded-full
font-semibold

${
recipe.status === "Firmada"

?

"bg-green-400 text-green-900"

:

"bg-yellow-300 text-yellow-900"

}

`}

>

{recipe.status}

</span>



</div>





<div className="p-6 space-y-5">



{/* INFORMACION */}

<div className="
grid
md:grid-cols-2
gap-4
">


<div

className="
bg-blue-50
rounded-2xl
p-4
"

>

<p className="text-sm text-gray-500">

Diagnóstico

</p>


<p className="font-bold text-blue-900">

{recipe.diagnosis || 
"Sin diagnóstico"}

</p>


</div>





<div

className="
bg-purple-50
rounded-2xl
p-4
"

>

<p className="text-sm text-gray-500">

Médico

</p>


<p className="font-bold text-purple-900">

{recipe.doctorName ||
"No registrado"}

</p>


</div>



</div>







{/* MEDICAMENTOS */}


<div>


<h3 className="
text-xl
font-bold
mb-4
flex
items-center
gap-2
">

💊 Medicamentos indicados

</h3>



<div className="
grid
md:grid-cols-2
gap-4
">


{
recipe.items?.map(
(medicine:any)=>(


<div

key={medicine.id}

className="
border
rounded-2xl
p-5
bg-gray-50
hover:bg-blue-50
transition
"

>


<h4 className="
font-bold
text-lg
text-blue-700
">

{medicine.medicineName}

</h4>



<div className="mt-3 space-y-2 text-gray-700">


<p>

<b>Dosis:</b>

{" "}

{medicine.dosage ||
"No indicada"}

</p>


<p>

<b>Horario:</b>

{" "}

{medicine.frequency ||
"No indicado"}

</p>


<p>

<b>Duración:</b>

{" "}

{medicine.duration ||
"No indicada"}

</p>



{
medicine.instructions && (

<p>

<b>Indicaciones:</b>

{" "}

{medicine.instructions}

</p>

)

}



</div>


</div>


))

}



</div>


</div>






{/* BOTONES */}

<div

className="
border-t
pt-5
flex
flex-wrap
gap-3
"

>


<button

onClick={()=>

window.open(
getPrescriptionPdfUrl(recipe.id),
"_blank"
)

}

className="
bg-blue-600
hover:bg-blue-700
text-white
px-6
py-3
rounded-2xl
flex
items-center
gap-2
font-semibold
transition
"

>

<Download size={20}/>

Descargar receta PDF

</button>





</div>




</div>



</div>



))

}



</div>

);

}


export default MyPrescriptionsPage;