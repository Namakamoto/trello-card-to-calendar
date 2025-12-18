# Card to Calendar - Trello PowerUp

A customer wanted some automisation in their Trello setup. After some discussion, dropping Trello out of their workflow to simplify it is not an option, therefore meet Card to Calendar! A Trello Power‑Up that adds an "Add to Calendar" button to each card. When clicked, it reads the card name and parses a date, optional time and guest count, then generates a downloadable `.ics` file.

## Card title formats

The first part of the card title must contain a date, with optional dots and year. Then, optionally, a time, and the rest of the title becomes the event summary. If the title ends with a number followed by `pax`, that number is treated as the guest count and added to the description.

Examples:

```
3.10 John Smith 40 pax
```

```
031025 8:30 Meeting 10 pax
```

```
05.10.25 Org Party
```

Supported date formats at the beginning of the card title:

- `D.MM`
- `DD.MM`
- `D.MM.` (trailing dot allowed)
- `DD.MM.`
- `D.MM.YY` or `DD.MM.YY`
- `D.MM.YYYY` or `DD.MM.YYYY`
- `DDMM`, `DDMMYY` or `DDMMYYYY` without dots

Supported time formats (immediately after the date):

- `H` or `HH` (e.g. `8`, `18`)
- `H:MM` or `HH:MM` (e.g. `8:30`, `18:00`)

If a time is provided the event lasts one hour by default. If no time is provided it becomes an all‑day event.

## Files
- **manifest.json** defines the Power‑Up name, description, icon and capabilities. The `card-buttons` capability points to `index.html` which will be shown when the button is clicked.
- **index.html** a simple page that loads the Trello Power‑Up client library and displays information about the event. It uses `client.js` to parse the card title and generate the `.ics` file.
- **client.js** implements all of the parsing and `.ics` generation logic. It uses the official `TrelloPowerUp` API to fetch the current card and render a download button for the calendar event.
- **icon.png** a placeholder icon for the Power‑Up. To be replaced with 128×128 PNG, or not, if the client is happy so am I.

## Time zone
This Power‑Up sets the event's time zone to `Europe/Vienna`. Modify the `TZID` in `client.js` if you need a different locale. For all‑day events the end date is set to the day after the start date, as per the iCalendar specification.