import { useLoaderData, Link, useCatch } from "remix";
import type { LoaderFunction } from "remix";
import { db } from "~/utils/db.server";
import { Joke } from "@prisma/client";

type LoaderData = {
  randomJoke: Joke
}
export const loader: LoaderFunction =async ({ params }) => {
  const count = await db.joke.count();
  const randomRowNumber = Math.floor(Math.random()*count);
  const [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: randomRowNumber
  });
  if (!randomJoke) {
    throw new Response("No random joke found", {
      status: 404
    })
  }
  const data: LoaderData = {randomJoke};
  return data;
}

export default function JokeIndexRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{data.randomJoke.content}</p>
      <Link to={data.randomJoke.id}>"{data.randomJoke.name}" Permalink</Link>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <div className="error-container">
        There is no joke to display.
      </div>
    )
  }
  throw new Error(
    `Unexpected caught response with status: ${caught.status}`
  );
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      I did a whoopsies
    </div>
  )
}
