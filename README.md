# Some Thing

![things-web](https://github.com/gcuddy/replicache-sk/assets/24555627/82883237-4d93-45af-9296-e2f4c18eafca)

A loving riff on the great [Things](https://culturedcode.com/things/) by Cultured Code, built as a [local-first](https://www.inkandswitch.com/local-first/) app with web technologies that supports realtime sync and sharing.

## Built with

- Svelte / Sveltekit
- Partykit (handling websockets and background sync)
- Replicache (client-side sync framework that utilizes IndexedDB)
- SQLite database on the Edge with Turso

## Features

- Date picker!

https://github.com/gcuddy/replicache-sk/assets/24555627/5f472bad-5061-4c9c-a0fe-ddb2d7172ce5

- Quick Find

https://github.com/gcuddy/replicache-sk/assets/24555627/75dde67a-aec4-470d-8d07-6b8bcad1f51a

- Projects, Areas, Lists

- Local-first: incredibly fast, no spinners, work offline - but still get syncing online

## Acknowledgments / Inspiration

Things 3 is one of my favorite pieces of software. I love its speed, maturity, and design. Its brilliant interface and interaction design still somehow feels fresh even though its design came out in 2017.

## TODO

- Enable users to share and collaborate on individual lists
- A more robust user system with authentication (currently it's just for demo purposes)
- Differentiate (more than semantically) between Projects, Areas, and Lists (my own feature addition)
- More robust repo structure (monorepo)
