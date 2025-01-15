<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Juridico;
use App\Models\Natural;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ClienteController extends Controller
{
    public function index()
    {
        $clientes = Cliente::where("estado","=",1)->with(['juridico', 'natural'])->get();
        
        // Retorna la respuesta JSON con los clientes
        return response()->json($clientes);
    }


    public function store(Request $request)
    {
        $messages = [
            'tipoCliente.required' => 'El tipo de cliente es obligatorio.',
            'tipoCliente.string' => 'El tipo de cliente debe ser una cadena de caracteres.',
            'telefono.required' => 'El teléfono es obligatorio.',
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'El correo debe ser una dirección de correo válida.',
            'direccion.required' => 'La dirección es obligatoria.',
            'estado.required' => 'El estado es obligatorio.',
            'natural.nombres.required' => 'Los nombres son obligatorios para el cliente Natural.',
            'natural.dni.unique' => 'El dni ya esta asociado a un cliente Natural.',
            'juridico.ruc.unique' => 'El ruc ya esta asociado a un cliente Juridico.',
            'juridico.razonSocial.required' => 'La razón social es obligatoria para el cliente Jurídico.',
        ];

        // Valida los datos comunes
        $request->validate([
            'tipoCliente' => 'required|string|max:255',
            'telefono' => 'required|string|max:15',
            'correo' => 'required|email',
            'direccion' => 'required|string|max:255',
        ], $messages); // Mensajes personalizados

        // Valida los datos del cliente relacionado dependiendo de su tipo
        if ($request->tipoCliente === 'Natural') {
            $request->validate([
                'natural.nombres' => 'required|string|max:255',
                'natural.apellidos' => 'required|string|max:255',
                'natural.dni' => 'required|string|size:8|unique:natural,dni',
            ], $messages); // Mensajes personalizados
        } elseif ($request->tipoCliente === 'Juridico') {
            $request->validate([
                'juridico.razonSocial' => 'required|string|max:255',
                'juridico.ruc' => 'required|string|max:20|unique:juridico,ruc',
                'juridico.representante' => 'required|string|max:255',
            ], $messages); // Mensajes personalizados
        }

        // Inicia la transacción
        DB::beginTransaction();

        try {
            // Crea el cliente base
            $cliente = Cliente::create([
                'tipoCliente' => $request->tipoCliente,
                'telefono' => $request->telefono,
                'correo' => $request->correo,
                'direccion' => $request->direccion,
                'estado' => $request->estado,
            ]);

            // Crea el cliente relacionado dependiendo del tipo de cliente
            if ($request->tipoCliente === 'Natural') {
                $clienteNatural = new Natural([
                    'nombres' => $request->natural['nombres'],
                    'apellidos' => $request->natural['apellidos'],
                    'dni' => $request->natural['dni'],
                    'idCliente' => $cliente->idCliente,
                    'estado' => $request->estado,
                ]);
                $clienteNatural->save();
            } elseif ($request->tipoCliente === 'Juridico') {
                $clienteJuridico = new Juridico([
                    'razonSocial' => $request->juridico['razonSocial'],
                    'ruc' => $request->juridico['ruc'],
                    'representante' => $request->juridico['representante'],
                    'idCliente' => $cliente->idCliente,
                    'estado' => $request->estado,
                ]);
                $clienteJuridico->save();
            }

            // Si todo está bien, realiza el commit de la transacción
            DB::commit();

            // Retorna el cliente creado, incluyendo los datos del cliente base y sus detalles relacionados
            return response()->json($cliente, 201);

        } catch (\Exception $e) {
            // Si ocurre un error, hace rollback
            DB::rollback();

            // Manejo del error
            return response()->json(['error' => 'Error al crear el cliente.'], 500);
        }
    }



    public function show($id)
    {
        // Obtiene un cliente específico por su ID
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        // Cargar relación condicionalmente
        if ($cliente->tipoCliente === 'natural') {
            $cliente->load('natural');
        } elseif ($cliente->tipoCliente === 'juridico') {
            $cliente->load('juridico');
        }

        return response()->json($cliente);
    }

    public function findCliente($valor)
    {
        if (!$valor) {
            return response()->json(['message' => 'Debe proporcionar un valor para buscar.'], 400);
        }

        // Buscar en la relación Natural por dni
        $clienteNatural = Cliente::whereHas('natural', function ($query) use ($valor) {
            $query->where('dni', $valor);
        })->with('natural')->first();

        if ($clienteNatural) {
            return response()->json($clienteNatural);
        }

        // Buscar en la relación Juridico por ruc
        $clienteJuridico = Cliente::whereHas('juridico', function ($query) use ($valor) {
            $query->where('ruc', $valor);
        })->with('juridico')->first();

        if ($clienteJuridico) {
            return response()->json($clienteJuridico);
        }

        return response()->json(['message' => 'Cliente no encontrado.'], 404);
    }

    public function update(Request $request, $idCliente)
    {
        $messages = [
            // Mensajes generales
            'tipoCliente.required' => 'El tipo de cliente es obligatorio.',
            'tipoCliente.string' => 'El tipo de cliente debe ser una cadena de texto.',
            'telefono.required' => 'El teléfono es obligatorio.',
            'telefono.string' => 'El teléfono debe ser una cadena de texto.',
            'telefono.max' => 'El teléfono no debe exceder 15 caracteres.',
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'El correo debe tener un formato válido.',
            'direccion.required' => 'La dirección es obligatoria.',
            'direccion.string' => 'La dirección debe ser una cadena de texto.',
            'direccion.max' => 'La dirección no debe exceder 255 caracteres.',
            'estado.required' => 'El estado es obligatorio.',
            'estado.boolean' => 'El estado debe ser verdadero o falso.',
        
            // Mensajes para cliente Natural
            'natural.nombres.required' => 'El nombre es obligatorio para clientes naturales.',
            'natural.nombres.string' => 'El nombre debe ser una cadena de texto.',
            'natural.nombres.max' => 'El nombre no debe exceder 255 caracteres.',
            'natural.apellidos.required' => 'El apellido es obligatorio para clientes naturales.',
            'natural.apellidos.string' => 'El apellido debe ser una cadena de texto.',
            'natural.apellidos.max' => 'El apellido no debe exceder 255 caracteres.',
            'natural.dni.required' => 'El DNI es obligatorio para clientes naturales.',
            'natural.dni.string' => 'El DNI debe ser una cadena de texto.',
            'natural.dni.max' => 'El DNI no debe exceder 20 caracteres.',
            'natural.dni.unique' => 'El DNI ya está en uso.',
        
            // Mensajes para cliente Juridico
            'juridico.razonSocial.required' => 'La razón social es obligatoria para clientes jurídicos.',
            'juridico.razonSocial.string' => 'La razón social debe ser una cadena de texto.',
            'juridico.razonSocial.max' => 'La razón social no debe exceder 255 caracteres.',
            'juridico.ruc.required' => 'El RUC es obligatorio para clientes jurídicos.',
            'juridico.ruc.string' => 'El RUC debe ser una cadena de texto.',
            'juridico.ruc.max' => 'El RUC no debe exceder 20 caracteres.',
            'juridico.ruc.unique' => 'El RUC ya está en uso.',
            'juridico.representante.required' => 'El representante es obligatorio para clientes jurídicos.',
            'juridico.representante.string' => 'El representante debe ser una cadena de texto.',
            'juridico.representante.max' => 'El representante no debe exceder 255 caracteres.',
        ];
        

        $validator = Validator::make($request->all(), [
            'tipoCliente' => 'required|string',
            'telefono' => 'required|string|max:15',
            'correo' => 'required|email',
            'direccion' => 'required|string|max:255',
            'estado' => 'required|boolean',
        ], $messages);
        
        // Comprobar si la validación falla
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error en la validación de datos.',
                'errors' => $validator->errors()
            ], 422);  // Código 422: Unprocessable Entity
        }

        DB::beginTransaction();

        try {
            // Buscar el cliente base
            $cliente = Cliente::findOrFail($idCliente);

            // Verificar si cambia el tipo de cliente
            if ($cliente->tipoCliente !== $request->tipoCliente) {
                // Eliminar el registro del tipo anterior
                if ($cliente->tipoCliente === 'Natural') {
                    Natural::where('idCliente', $idCliente)->delete();
                } elseif ($cliente->tipoCliente === 'Juridico') {
                    Juridico::where('idCliente', $idCliente)->delete();
                }

                // Crear el nuevo registro del tipo correspondiente
                // if ($request->tipoCliente === 'Natural') {
                //     $request->validate([
                //         'natural.nombres' => 'required|string|max:255',
                //         'natural.apellidos' => 'required|string|max:255',
                //         'natural.dni' => 'required|string|max:20|unique:natural,dni,' . $idCliente . ',idCliente',
                //     ], $messages);

                //     $clienteNatural = new Natural([
                //         'idCliente' => $idCliente,
                //         'nombres' => $request->natural['nombres'],
                //         'apellidos' => $request->natural['apellidos'],
                //         'dni' => $request->natural['dni'],
                //         'estado' => $request->estado,
                //     ]);
                //     $clienteNatural->save();
                // } elseif ($request->tipoCliente === 'Juridico') {
                //     $request->validate([
                //         'juridico.razonSocial' => 'required|string|max:255',
                //         'juridico.ruc' => 'required|string|max:20|unique:juridico,ruc,' . $idCliente . ',idCliente',
                //         'juridico.representante' => 'required|string|max:255',
                //     ], $messages);

                //     $clienteJuridico = new Juridico([
                //         'idCliente' => $idCliente,
                //         'razonSocial' => $request->juridico['razonSocial'],
                //         'ruc' => $request->juridico['ruc'],
                //         'representante' => $request->juridico['representante'],
                //         'estado' => $request->estado,
                //     ]);
                //     $clienteJuridico->save();
                // }
                if ($request->tipoCliente === 'Natural') {
                    // Validar los datos de cliente natural
                    $validator = Validator::make($request->all(), [
                        'natural.nombres' => 'required|string|max:255',
                        'natural.apellidos' => 'required|string|max:255',
                        'natural.dni' => 'required|string|max:20|unique:natural,dni,' . $idCliente . ',idCliente',
                    ], $messages);
                
                    // Si la validación falla, retornar los errores con código 422
                    if ($validator->fails()) {
                        return response()->json([
                            'message' => 'Error en la validación de datos.',
                            'errors' => $validator->errors()
                        ], 422);
                    }
                
                    // Si pasa la validación, crear el cliente natural
                    $clienteNatural = new Natural([
                        'idCliente' => $idCliente,
                        'nombres' => $request->natural['nombres'],
                        'apellidos' => $request->natural['apellidos'],
                        'dni' => $request->natural['dni'],
                        'estado' => $request->estado,
                    ]);
                    $clienteNatural->save();
                
                } elseif ($request->tipoCliente === 'Juridico') {
                    // Validar los datos de cliente jurídico
                    $validator = Validator::make($request->all(), [
                        'juridico.razonSocial' => 'required|string|max:255',
                        'juridico.ruc' => 'required|string|max:20|unique:juridico,ruc,' . $idCliente . ',idCliente',
                        'juridico.representante' => 'required|string|max:255',
                    ], $messages);
                
                    // Si la validación falla, retornar los errores con código 422
                    if ($validator->fails()) {
                        return response()->json([
                            'message' => 'Error en la validación de datos.',
                            'errors' => $validator->errors()
                        ], 422);
                    }
                
                    // Si pasa la validación, crear el cliente jurídico
                    $clienteJuridico = new Juridico([
                        'idCliente' => $idCliente,
                        'razonSocial' => $request->juridico['razonSocial'],
                        'ruc' => $request->juridico['ruc'],
                        'representante' => $request->juridico['representante'],
                        'estado' => $request->estado,
                    ]);
                    $clienteJuridico->save();
                }
            } else {
                // Si el tipo no cambia, actualizar solo el registro del tipo correspondiente
                if ($request->tipoCliente === 'Natural') {
                    $request->validate([
                        'natural.nombres' => 'required|string|max:255',
                        'natural.apellidos' => 'required|string|max:255',
                        'natural.dni' => 'required|string|max:20|unique:natural,dni,' . $idCliente . ',idCliente',
                    ], $messages);

                    Natural::where('idCliente', $idCliente)->update([
                        'nombres' => $request->natural['nombres'],
                        'apellidos' => $request->natural['apellidos'],
                        'dni' => $request->natural['dni'],
                    ]);
                } elseif ($request->tipoCliente === 'Juridico') {
                    $request->validate([
                        'juridico.razonSocial' => 'required|string|max:255',
                        'juridico.ruc' => 'required|string|max:20|unique:juridico,ruc,' . $idCliente . ',idCliente',
                        'juridico.representante' => 'required|string|max:255',
                    ], $messages);

                    Juridico::where('idCliente', $idCliente)->update([
                        'razonSocial' => $request->juridico['razonSocial'],
                        'ruc' => $request->juridico['ruc'],
                        'representante' => $request->juridico['representante'],
                    ]);
                }
            }

            $cliente->update([
                'tipoCliente' => $request->tipoCliente,
                'telefono' => $request->telefono,
                'correo' => $request->correo,
                'direccion' => $request->direccion,
                'estado' => $request->estado,
            ]);
            $cliente->save();

            DB::commit();

            $cliente->load('natural', 'juridico');
            return response()->json($cliente, 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Error al actualizar el cliente: ' . $e->getMessage()], 500);
        }
    }


    public function destroy($id)
    {
        $cliente = Cliente::find($id);
    
        if (!$cliente) {
            return response()->json([
                'message' => 'Cliente no encontrado.'
            ], 404);  // Código 404: No encontrado
        }
    
        try {
            // Eliminar el cliente
            $cliente->estado = 0;  // Suponiendo que "estado" representa la eliminación lógica
            $cliente->save();
    
            return response()->json([
                'message' => 'Cliente eliminado correctamente.'
            ], 200);  // Código 200: OK
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el cliente.',
                'error' => $e->getMessage()
            ], 500);  // Código 500: Error interno del servidor
        }
    }
    
}
