import { json, useLoaderData } from "@remix-run/react"
import createServerSupabase from "utils/supabase.server"

import type { LoaderFunction } from "@remix-run/node"
import Login from "components/login"

export const loader: LoaderFunction = async ({request}) => {
  const response = new Response()
  const supabase = createServerSupabase({ request, response })
  const { data } = await supabase.from("messages").select()
  return json({ messages: data ?? [] }, {headers: response.headers})
}

export default function Index() {
  const { messages } = useLoaderData<typeof loader>()
  return (
    <>
      <Login />
      <pre>{JSON.stringify(messages, null, 2)}</pre>
    </>
  )
}