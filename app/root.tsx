import { json, MetaFunction } from "@remix-run/node"
import createServerSupabase from "utils/supabase.server"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react"
import { SupabaseClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

import type { Database } from "db_types"
import { createBrowserClient } from "@supabase/auth-helpers-remix"

type TypedSupabaseClient = SupabaseClient<Database>

export type SupabaseOutletContext = {
  supabase: TypedSupabaseClient
}

export const meta: MetaFunction = () => [
  { charset: "utf-8" },
  { title: "New Remix App" },
  { viewport: "width=device-width,initial-scale=1" },
]

export const loader = async ({ request }: { request: Request }) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  }
  const response = new Response()
  const supabase = createServerSupabase({ request, response })

  const {
    data: session,
  } = await supabase.auth.getSession()

  return json({ env, session }, {headers: response.headers})
}

export default function App() {
  const { env, session } = useLoaderData<typeof loader>()
  const revalidator = useRevalidator()

  const [supabase] = useState(() =>
    createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  )

  const serverAccessToken = session?.session?.access_token
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverAccessToken) {
        revalidator.revalidate()
      }
    });
  
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, serverAccessToken, revalidator]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{ supabase }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}