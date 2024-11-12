import { Form, json, useLoaderData } from "@remix-run/react"
import createServerSupabase from "utils/supabase.server"

import type { LoaderFunction } from "@remix-run/node"
import Login from "components/login"

export const action = async ({ request }: { request: Request }) => {
  const response = new Response()
  const supabase = createServerSupabase({ request, response })
  
  const formData = await request.formData()
  const message = formData.get('message') as string;

  await supabase.from("messages").insert({ content: String(message) })

  return json(null, { headers: response.headers })
};


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
      <Form method="post">
        <input type="text" name="message" />
        <button type="submit">Send</button>
      </Form>
    </>
  )
}