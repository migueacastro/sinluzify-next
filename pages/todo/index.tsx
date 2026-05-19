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
        <ul>
            {
                todos.map((todo: any) => (
                    <li key={todo?.id} > {todo?.name} </li>
                ))
            }
        </ul>
    )
}