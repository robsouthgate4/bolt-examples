# Bolt WebGL examples repo

## Getting Started

To
contribute
you need
to get
this
project up
and
running on
your
machine.

### ⏳ Installation

Clone the
repository
using your
favorite
git client
or CLI!

Then
normalise
Node/NPM
version:

```bash
nvm use
```

Install
dependencies:

```bash
npm install
```

To fire up
the
project
run:

```bash
npm run dev
```

To build
project
run:

```bash
npm run build
```

Open
[http://localhost:8888](http://localhost:8888)
with your
browser to
see the
app.

## Features

-   **[ESLint](https://eslint.org/)**
    Configuration:
    -   Uses
        [Prettier](https://prettier.io/)
        ESLint
        plugin
        for
        consistent
        code
        style.

## Learn More

To format
ESlint on
save in
VScode,
open your
workspace
settings
('Shift-Command-P'
and select
'Open
Workspace
Settings
(JSON)'),
then paste
the
following
in:

`/.vscode/settings.json`

```json
{
	"editor.formatOnSave": false,
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": true
	}
}
```
