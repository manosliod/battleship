# Decisions

## The name prompt rejects blank names and Cancel ends the program

In 2022 the prompt checked for an empty name with `==`, which compares objects, not text. So an empty name was
accepted, and Cancel brought the prompt back forever.

Now:

- A name made only of spaces, tabs or nothing is refused, and the prompt asks again with
  "Your name can't be blank. Please insert your name and press 'OK'".
- Spaces around a name are removed.
- Cancel (or closing the dialog) ends the program.

The recordings in `docs/portfolio/before/` stay as they were: they show the old program. The tests still check that
the first prompt shows the recorded message, and that a name is accepted on the first prompt (`name-ok`). The flows
whose result changed (`name-empty`, `name-whitespace`, `name-cancel-then-ok`, `name-cancel-x3-then-ok`) are tested
with new inputs in `PlayerNameCollectorTest`, so blank names and Cancel stay tested.
