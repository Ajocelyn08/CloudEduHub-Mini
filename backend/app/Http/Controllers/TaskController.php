<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $tasks = Task::where('user_id', $request->user()->id)->get();

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo'      => 'required|string|max:255',
            'descripcion' => 'nullable|string',
        ]);

        $task = Task::create([
            'titulo'      => $request->titulo,
            'descripcion' => $request->descripcion,
            'user_id'     => $request->user()->id,
        ]);

        return response()->json($task, 201);
    }

    public function update(Request $request, $id)
    {
        $task = Task::where('user_id', $request->user()->id)->findOrFail($id);

        $request->validate([
            'titulo'      => 'sometimes|string|max:255',
            'descripcion' => 'sometimes|nullable|string',
            'completado'  => 'sometimes|boolean',
        ]);

        $task->update($request->only('titulo', 'descripcion', 'completado'));

        return response()->json($task);
    }

    public function destroy(Request $request, $id)
    {
        $task = Task::where('user_id', $request->user()->id)->findOrFail($id);
        $task->delete();

        return response()->json(null, 204);
    }
}