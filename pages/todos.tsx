import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Page() {
    const [todos, setTodos] = useState([])

    useEffect(() => {
        async function getTodos() {
            const { data: todos }: any = await supabase.from('todos').select()

            if (todos) {
                setTodos(todos)
            }
        }

        getTodos()
    }, [])

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/50 backdrop-blur-xl space-y-4">
                <h1 className="text-xl font-bold tracking-tight">Lista de Tareas</h1>
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {todos.length > 0 ? (
                        todos.map((todo: any) => (
                            <li key={todo?.id} className="py-2.5 text-sm flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                                {todo?.name}
                            </li>
                        ))
                    ) : (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 py-2">No hay tareas creadas todavía.</p>
                    )}
                </ul>
            </div>
        </div>
    )
}
