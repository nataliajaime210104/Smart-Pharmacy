import { useEffect, useState } from "react";
import type {
  User,
  InventoryItem,
  Medicine,
} from "../../shared/types";

import "../../styles/pharmacy-dashboard.css";

import {
  getInventory,
  getLowStockInventory,
  getMedicines,
} from "./services/pharmacy.service";

import {
  Pill,
  Boxes,
  TriangleAlert,
  Tags,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";


interface Props {
  user: User;
}


function DashboardPage({ user }: Props) {

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);


  useEffect(() => {

    async function loadDashboard() {

      try {

        const [
          inventoryData,
          lowStockData,
          medicinesData
        ] = await Promise.all([

          getInventory(),

          getLowStockInventory(),

          getMedicines(),

        ]);


        setInventory(inventoryData);

        setLowStock(lowStockData);

        setMedicines(medicinesData);


      } catch (error) {

        console.error(
          "Error cargando dashboard:",
          error
        );

      }

    }


    loadDashboard();

  }, []);



  const totalStock = inventory.reduce(

    (total, item) => total + item.stock,

    0

  );



  const activeInventory = inventory.filter(

    (item) => item.status === "Activo"

  ).length;



  const inventoryStatus = [

    {
      name: "Correcto",
      cantidad: Math.max(
        inventory.length - lowStock.length,
        0
      ),
    },

    {
      name: "Bajo",
      cantidad: lowStock.length,
    },

  ];



  return (

    <div className="dashboard-container">


      {/* HEADER */}

      <section className="dashboard-hero">

        <div>

          <span className="dashboard-badge">

            SMARTPHARMACY

          </span>


          <h1>
            Inventory Control Center
          </h1>


          <p>

            Bienvenido <strong>{user.name}</strong>.

            <br />

            Administra el inventario, supervisa el stock y mantén
            el control de todos los medicamentos desde un solo lugar.

          </p>


        </div>


      </section>



      {/* TARJETAS */}


      <section className="dashboard-cards">



        <div className="stat-card blue">

          <div className="card-top">

            <div className="icon-circle">

              <Pill size={34}/>

            </div>

          </div>


          <h2>
            {medicines.length}
          </h2>


          <h4>
            Medicamentos
          </h4>


          <p>
            Registrados en el sistema
          </p>


        </div>




        <div className="stat-card green">


          <div className="card-top">


            <div className="icon-circle">

              <Boxes size={34}/>

            </div>


          </div>



          <h2>
            {totalStock}
          </h2>


          <h4>
            Stock Total
          </h4>


          <p>
            Unidades disponibles
          </p>


        </div>





        <div className="stat-card orange">


          <div className="card-top">


            <div className="icon-circle">

              <TriangleAlert size={34}/>

            </div>


          </div>



          <h2>
            {lowStock.length}
          </h2>


          <h4>
            Stock Bajo
          </h4>


          <p>
            Requieren atención
          </p>


        </div>





        <div className="stat-card purple">


          <div className="card-top">


            <div className="icon-circle">

              <Tags size={34}/>

            </div>


          </div>



          <h2>
            {activeInventory}
          </h2>


          <h4>
            Inventarios Activos
          </h4>


          <p>
            Registros activos
          </p>


        </div>



      </section>



      {/* GRAFICAS */}

 
      <section className="dashboard-grid">


      
                {/* ESTADO DEL INVENTARIO */}


        <div className="dashboard-panel">


          <div className="panel-header">


            <div>

              <BarChart3 size={22}/>

              <h3>
                Estado del Inventario
              </h3>


            </div>


          </div>



         <div style={{ width: "100%", height: 300 }}>

  <ResponsiveContainer>

    <BarChart data={inventoryStatus}>

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis 
        dataKey="name"
      />

      <YAxis />

      <Tooltip />


      <Bar 
        dataKey="cantidad"
        radius={[10,10,0,0]}
      >

        {
          inventoryStatus.map((item,index)=>(

            <Cell

              key={`cell-${index}`}

              fill={
                item.name === "Correcto"
                  ? "#22c55e"
                  : "#f97316"
              }

            />

          ))
        }


      </Bar>


    </BarChart>


  </ResponsiveContainer>


</div>


        </div>



      </section>





      {/* INVENTARIO CRITICO */}



      <section className="dashboard-panel">


        <div className="panel-header">


          <div>


            <TriangleAlert size={22}/>


            <h3>
              Inventario Crítico
            </h3>


          </div>



          <button>


            Ver Inventario


            <ArrowRight size={18}/>


          </button>



        </div>




        <table className="critical-table">


          <thead>


            <tr>


              <th>
                Medicamento
              </th>


              <th>
                Código
              </th>


              <th>
                Stock
              </th>


              <th>
                Estado
              </th>


            </tr>


          </thead>



          <tbody>


            {lowStock.length === 0 && (

              <tr>

                <td colSpan={4}>

                  No existen medicamentos con bajo stock.

                </td>

              </tr>

            )}



            {lowStock.map((item) => (


              <tr key={item.id}>


                <td>
                  {item.medicineName}
                </td>



                <td>
                  {item.medicineCode}
                </td>



                <td>
                  {item.stock}
                </td>



                <td>


                  <span

                    className={

                      item.stock <= item.minStock

                        ? "badge danger"

                        : "badge warning"

                    }

                  >


                    {

                      item.stock <= item.minStock

                        ? "Crítico"

                        : "Bajo"

                    }


                  </span>



                </td>



              </tr>


            ))}



          </tbody>



        </table>



      </section>







    </div>

  );

}



export default DashboardPage;