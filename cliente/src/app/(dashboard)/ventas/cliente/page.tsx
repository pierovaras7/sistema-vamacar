"use client"
import FormModal from "@/components/FormModal";

const VentasPage = () => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Evita la recarga de la página
    // Aquí puedes manejar el envío de datos de tu formulario
    console.log("Formulario enviado sin recargar la página");
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h2>Ventas Page</h2>
        <FormModal table="cliente" type="create" />
        <input type="text" name="codigo" id="" />
        <button type="submit">Enviar</button>
      </form>
    </>
  );
};

export default VentasPage;

