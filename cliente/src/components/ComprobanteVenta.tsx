// ComprobanteVenta.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Venta } from '@/types';


// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 10, // Reducir el padding para que quepa mejor en el ancho
    fontSize: 4, // Ajustar tamaño de fuente para 57mm
    textTransform: 'uppercase', // Aplicar mayúsculas globalmente
  },
  header: {
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: 'bold',
    padding: 5
  },
  title: {
    fontSize: 5,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  section: {
    marginBottom: 8, // Reducir espaciado entre secciones
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3, // Reducir espaciado entre filas
    fontSize: 4
  },
  table: {
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    fontWeight: 'bold',
    fontSize: 4, // Tamaño más pequeño para caber en 57mm
    paddingBottom: 3,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    fontSize: 4, // Reducir tamaño de fuente en filas
  },
  footer: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 5, // Reducir tamaño de fuente en el pie
  },
});

const ComprobanteVenta: React.FC<{ venta: Venta }> = ({ venta }) => (
  <Document>
    <Page   
      size={{ width: '57mm', height: '100%' }} 
      style={styles.page}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Comprobante de Venta</Text>
        <Text>Sede: {venta.sede?.direccion}</Text>
      </View>

      {/* Información general */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text>Fecha: {venta.fecha}</Text>
          <Text>Venta: VEN-{venta.idVenta}</Text>
        </View>
        <View style={styles.row}>
          {/* Cliente: Natural o Jurídico */}
          <Text>
            Cliente: 
            {venta.cliente?.natural ? ` ${venta.cliente.natural.nombres} ${venta.cliente.natural.apellidos}` // Cliente natural
                : venta.cliente?.juridico?.razonSocial // Cliente jurídico
      } {/* Cliente no existe */}
          </Text>

          {/* Trabajador (Opcional) */}
          {venta.trabajador && (
            <Text>
              Trabajador: {venta.trabajador.nombres} {venta.trabajador.apellidos}
            </Text>
          )}
        </View>

        <View style={styles.row}>
          <Text>Tipo de Venta: {venta.tipoVenta}</Text>
          {venta.metodoPago && (
            <Text>Método de Pago: {venta.metodoPago}</Text>
          )}
        </View>
      </View>

      {/* Detalles de la venta */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={{ width: '40%' }}>Descripción</Text>
          <Text style={{ width: '20%', textAlign: 'center' }}>Cantidad</Text>
          <Text style={{ width: '20%', textAlign: 'center' }}>Precio Unit.</Text>
          <Text style={{ width: '20%', textAlign: 'center' }}>Total</Text>
        </View>
        {venta.detalles?.map((detalle, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={{ width: '40%' }}>{detalle.producto.descripcion}</Text>
            <Text style={{ width: '20%', textAlign: 'center' }}>{detalle.cantidad}</Text>
            <Text style={{ width: '20%', textAlign: 'center' }}>{detalle.precio}</Text>
            <Text style={{ width: '20%', textAlign: 'center' }}>{detalle.subtotal}</Text>
          </View>
        ))}
        <View style={{ height: 1, backgroundColor: '#000', marginVertical: 1 }} />
        <View style={styles.tableRow}>
          <Text style={{ width: '80%', textAlign: 'left' }}>Total Venta:</Text>
          <Text style={{ width: '20%', textAlign: 'center' }}>S/. {venta.total}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={{ width: '80%', textAlign: 'left' }}>Monto Pagado:</Text>
          <Text style={{ width: '20%', textAlign: 'center' }}>S/. {venta.montoPagado}</Text>
        </View>

      </View>

      

      {/* Pie de página */}
      <View style={styles.footer}>
        <Text>¡Gracias por su compra!</Text>
        <Text>Por favor, conserve este comprobante.</Text>
      </View>
    </Page>
  </Document>
);

export default ComprobanteVenta;