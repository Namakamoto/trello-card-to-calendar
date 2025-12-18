# Calendar Event Power-Up for Trello

This sample Trello Power‑Up adds an "Add to Calendar" button to each card. When clicked, it reads the card name and parses a date, optional time and guest count, then generates a downloadable `.ics` file so you can quickly add the event to your calendar.

## Card title formats

The first part of the card title must contain a date, with optional dots and year. After an optional time, the rest of the title becomes the event summary. If the title ends with a number followed by `pax`, that number is treated as the guest count and added to the event description.

Examples:

```
3.10 John Smith 40 pax
031025 8:30 Meeting 10 pax
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

## Structure

- **manifest.json** — defines the Power‑Up name, description, icon and capabilities. The `card-buttons` capability points to `index.html` which will be shown when the button is clicked.
- **index.html** — a simple page that loads the Trello Power‑Up client library and displays information about the event. It uses `client.js` to parse the card title and generate the `.ics` file.
- **client.js** — implements all of the parsing and `.ics` generation logic. It uses the official `TrelloPowerUp` API to fetch the current card and render a download button for the calendar event.
- **icon.png** — a placeholder icon for the Power‑Up. You can replace this with your own 128×128 PNG.

## Deployment

To use this Power‑Up on Trello:

1. Host these files on a public HTTPS server (e.g. GitHub Pages, Netlify, Vercel or Cloudflare Pages).
2. Note the URL where you host them; Trello will request `manifest.json` at that URL.
3. In the [Trello Power‑Up admin dashboard](https://trello.com/power-ups/admin), create a new custom Power‑Up and specify the URL to your `manifest.json`.
4. Add the Power‑Up to a board. A button labelled **Add to Calendar** will appear on each card. Clicking it opens a modal with a link to download the calendar event.

## Time zone

This Power‑Up sets the event's time zone to `Europe/Vienna`. Modify the `TZID` in `client.js` if you need a different locale. For all‑day events the end date is set to the day after the start date, as per the iCalendar specification.

## Limitations

This sample Power‑Up does not upload the `.ics` file to Trello or attach it to the card. It simply provides a downloadable link when the button is clicked. Feel free to enhance the logic to suit your needs — for example, adding custom durations, attaching files back to the card, or parsing additional metadata such as location.