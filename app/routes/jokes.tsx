import React, { useState, useEffect } from "react";
import { Outlet, Link, useLoaderData } from 'remix';
import type { LinksFunction, LoaderFunction } from 'remix';
import invariant from 'tiny-invariant';
import { db } from '~/utils/db.server';
import styleUrl from '~/styles/jokes.css';
import { User } from '@prisma/client';
import { getUser } from '~/utils/session.server';
import Test from "~/components/test";

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: styleUrl,
    },
  ];
};

type LoaderData = {
  user: User | null;
  jokeListItems: Array<{ id: string; name: string }>;
};
export const loader: LoaderFunction = async ({ request }) => {
  const jokeListItems = await db.joke.findMany({
    take: 5,
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
  });
  const user = await getUser(request);
  const data: LoaderData = {
    user,
    jokeListItems,
  };
  return data;
};

export default function JokeRoute() {
  const [test, setTest] = useState<string>("");
  const data = useLoaderData<LoaderData>();
  invariant(data, 'Expect data is not empty');

  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    setTest(e.currentTarget.value)
  }

  useEffect(() => {
    console.log(test)
  }, [test]);
  useEffect(() => {
    setTest("dung");
  },[]);

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {
            data.user ? (
              <div className="user-info">
                <span>{`Hi ${data.user.username}`}</span>
                <form action="/logout" method="post">
                  <button type="submit" className='button'>Logout</button>
                </form>
              </div>
            ) : (
              <Link to="/login">Login</Link>
            )
          }
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <Test test={test} />
            <ul>
              {data.jokeListItems.map((joke) => (
                <li key={joke.id}>
                  <Link prefetch="intent" to={joke.id}>{joke.name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
            <input type="text" name="test" id="test" value={test} onChange={onChange} />
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
